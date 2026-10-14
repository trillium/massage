'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import {
  type Entry,
  type RaffleVars,
  type VarOverrides,
  DEFAULT_WINNER_TEMPLATE,
  DEFAULT_NON_WINNER_TEMPLATE,
  capitalizeName,
  resolveTemplate,
} from './WinnerMessageComponents'
import { adminFetch } from '@/lib/adminFetch'
import type { FieldHistoryEntry } from '@/lib/raffle'

interface UseWinnerMessagesOptions {
  winner: Entry
  nonWinners: Entry[]
  raffleName: string
  raffleId: string
  savedWinnerTemplate: string | null
  savedNonWinnerTemplate: string | null
  savedUpgradeMinutes: number
  savedBookingLink: string | null
  expirationDate: string | null
  fieldHistory: FieldHistoryEntry[]
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function useWinnerMessages({
  winner,
  nonWinners,
  raffleName,
  raffleId,
  savedWinnerTemplate,
  savedNonWinnerTemplate,
  savedUpgradeMinutes,
  savedBookingLink,
  expirationDate,
  fieldHistory,
}: UseWinnerMessagesOptions) {
  const [winnerTemplate, setWinnerTemplate] = useState(savedWinnerTemplate ?? DEFAULT_WINNER_TEMPLATE)
  const [nonWinnerTemplate, setNonWinnerTemplate] = useState(savedNonWinnerTemplate ?? DEFAULT_NON_WINNER_TEMPLATE)
  const [upgradeMinutes, setUpgradeMinutes] = useState(savedUpgradeMinutes ?? 30)
  const [bookingLink, setBookingLink] = useState(savedBookingLink ?? 'https://trilliummassage.la/book')
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [entryVarOverrides, setEntryVarOverrides] = useState<Record<string, VarOverrides>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [smsSent, setSmsSent] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    if (winner.sms_sent_at) init[winner.id] = true
    for (const e of nonWinners) if (e.sms_sent_at) init[e.id] = true
    return init
  })
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lastUpdatedFormatted = useMemo(() => {
    const byField: Record<string, string> = {}
    for (const h of fieldHistory) {
      if (!byField[h.field]) byField[h.field] = h.changed_at
    }
    return {
      winnerTemplate: byField.sms_template_winner ? formatRelative(byField.sms_template_winner) : null,
      nonWinnerTemplate: byField.sms_template_non_winner ? formatRelative(byField.sms_template_non_winner) : null,
    }
  }, [fieldHistory])

  const raffleVars: RaffleVars = { upgradeMinutes, bookingLink, expiration: expirationDate }

  function getResolvedMessage(entryId: string, template: string, entry: Entry) {
    return overrides[entryId] !== undefined
      ? overrides[entryId]
      : resolveTemplate(template, entry, raffleVars, entryVarOverrides[entryId])
  }

  function handleVarOverride(entryId: string, varName: string, value: string) {
    setEntryVarOverrides((prev) => ({ ...prev, [entryId]: { ...(prev[entryId] ?? {}), [varName]: value } }))
    setOverrides((prev) => { const next = { ...prev }; delete next[entryId]; return next })
  }

  function setOverride(entryId: string, value: string) {
    setOverrides((prev) => ({ ...prev, [entryId]: value }))
  }

  function clearOverrides() { setOverrides({}) }

  const debouncedSaveRaffleField = useCallback(
    (field: string, value: unknown) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
      setSaveStatus('saving')
      saveTimerRef.current = setTimeout(async () => {
        await adminFetch(`/api/admin/raffle/${raffleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        })
        setSaveStatus('saved')
        statusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
      }, 800)
    },
    [raffleId]
  )

  async function saveRaffleFieldNow(field: string, value: unknown) {
    setSaveStatus('saving')
    await adminFetch(`/api/admin/raffle/${raffleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    setSaveStatus('saved')
    statusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
  }

  async function toggleSmsSent(entry: Entry) {
    const nowSent = !smsSent[entry.id]
    setSmsSent((p) => ({ ...p, [entry.id]: nowSent }))
    try {
      await adminFetch(`/api/admin/raffle/entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sms_sent_at: nowSent ? new Date().toISOString() : null }),
      })
    } catch {
      setSmsSent((p) => ({ ...p, [entry.id]: !nowSent }))
    }
  }

  function handleWinnerTemplateChange(value: string) {
    setWinnerTemplate(value); clearOverrides(); debouncedSaveRaffleField('sms_template_winner', value)
  }

  function handleNonWinnerTemplateChange(value: string) {
    setNonWinnerTemplate(value); clearOverrides(); debouncedSaveRaffleField('sms_template_non_winner', value)
  }

  async function handleUpgradeMinutesChange(v: number) {
    setUpgradeMinutes(v); clearOverrides(); await saveRaffleFieldNow('upgrade_minutes', v)
  }

  async function handleBookingLinkChange(v: string) {
    setBookingLink(v); clearOverrides(); debouncedSaveRaffleField('booking_link', v)
  }

  function exportJson() {
    const allEntries = [winner, ...nonWinners]
    const messages = allEntries.map((entry) => ({
      id: entry.id,
      name: capitalizeName(entry.name),
      phone: entry.phone,
      email: entry.email,
      type: entry.is_winner ? 'winner' : 'non-winner',
      message: getResolvedMessage(entry.id, entry.is_winner ? winnerTemplate : nonWinnerTemplate, entry),
      status: smsSent[entry.id] ? 'sent' : 'draft',
      sent_at: smsSent[entry.id] ? (entry.sms_sent_at ?? new Date().toISOString()) : null,
    }))
    const blob = new Blob(
      [JSON.stringify({ raffle: raffleName, exported_at: new Date().toISOString(), messages }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sms-${raffleName.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    winnerTemplate,
    nonWinnerTemplate,
    upgradeMinutes,
    bookingLink,
    saveStatus,
    lastUpdatedFormatted,
    smsSent,
    raffleVars,
    entryVarOverrides,
    getResolvedMessage,
    handleVarOverride,
    setOverride,
    toggleSmsSent,
    handleWinnerTemplateChange,
    handleNonWinnerTemplateChange,
    handleUpgradeMinutesChange,
    handleBookingLinkChange,
    exportJson,
    sentCount: Object.values(smsSent).filter(Boolean).length,
    totalCount: 1 + nonWinners.length,
  }
}
