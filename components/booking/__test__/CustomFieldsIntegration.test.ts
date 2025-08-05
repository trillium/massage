/**
 * @file CustomFieldsIntegration.test.ts
 * @description Tests the custom fields system that allows different booking slugs
 * to show different form fields based on their configuration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import configSlice, { setBulkConfigSliceState } from '@/redux/slices/configSlice'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { SlugConfigurationType } from '@/lib/types'

type TestAdditionalData = {
  showHotelField?: boolean
  showParkingField?: boolean
  showNotesField?: boolean
}

type TestConfig = {
  customFields?: {
    showHotelField?: boolean
    showParkingField?: boolean
    showNotesField?: boolean
  }
}

type RootState = {
  config: SlugConfigurationType
}

describe('Custom Fields Integration', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        config: configSlice,
      },
    })
  })

  describe('hotel-june configuration', () => {
    it('should have customFields configured with hotel and notes fields enabled', async () => {
      const slugConfigurations = await fetchSlugConfigurationData()
      const hotelJuneConfig = slugConfigurations['hotel-june']

      expect(hotelJuneConfig).toBeDefined()
      expect(hotelJuneConfig.customFields).toEqual({
        showHotelField: true,
        showNotesField: true,
      })
    })

    it('should not have parking field enabled for hotel-june', async () => {
      const slugConfigurations = await fetchSlugConfigurationData()
      const hotelJuneConfig = slugConfigurations['hotel-june']

      expect(hotelJuneConfig.customFields?.showParkingField).toBeUndefined()
    })
  })

  describe('other configurations', () => {
    it('should not have custom fields for configurations that do not specify them', async () => {
      const slugConfigurations = await fetchSlugConfigurationData()
      const fooConfig = slugConfigurations['foo']

      expect(fooConfig).toBeDefined()
      expect(fooConfig.customFields).toBeUndefined()
    })
  })

  describe('Redux integration', () => {
    it('should accept custom fields in config state', () => {
      const customFieldsConfig: Partial<SlugConfigurationType> = {
        customFields: {
          showHotelField: true,
          showParkingField: true,
          showNotesField: false,
        },
      }

      store.dispatch(setBulkConfigSliceState(customFieldsConfig))
      const state = store.getState() as RootState

      expect(state.config.customFields).toEqual({
        showHotelField: true,
        showParkingField: true,
        showNotesField: false,
      })
    })
  })

  describe('field visibility logic', () => {
    it('should show hotel field when customFields.showHotelField is true', () => {
      const config: TestConfig = { customFields: { showHotelField: true } }
      const additionalData: TestAdditionalData = {}

      const shouldShowHotelField =
        additionalData.showHotelField || config?.customFields?.showHotelField

      expect(shouldShowHotelField).toBe(true)
    })

    it('should show notes field when customFields.showNotesField is true', () => {
      const config: TestConfig = { customFields: { showNotesField: true } }
      const additionalData: TestAdditionalData = {}

      const shouldShowNotesField =
        additionalData.showNotesField || config?.customFields?.showNotesField

      expect(shouldShowNotesField).toBe(true)
    })

    it('should not show parking field when customFields.showParkingField is false/undefined', () => {
      const config: TestConfig = { customFields: { showHotelField: true, showNotesField: true } }
      const additionalData: TestAdditionalData = {}

      const shouldShowParkingField =
        additionalData.showParkingField || config?.customFields?.showParkingField

      expect(shouldShowParkingField).toBeFalsy()
    })

    it('should prioritize additionalData over config when both are present', () => {
      const config: TestConfig = { customFields: { showHotelField: false } }
      const additionalData: TestAdditionalData = { showHotelField: true }

      const shouldShowHotelField =
        additionalData.showHotelField || config?.customFields?.showHotelField

      expect(shouldShowHotelField).toBe(true)
    })
  })
})
