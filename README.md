<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://trilliummassage.la/">
    <img src="public/static/images/logo.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Trillium Massage</h3>

  <p align="center">
    Let the spa come to you. Providing in-home massage therapy and wellness to the LA Metro Area
    <br />
    <a href="https://trilliummassage.la/"><strong>Visit the site »</strong></a>
    <br />
    <br />
    <a href="https://trilliummassage.la/">View Live Site</a>
    ·
    <a href="https://github.com/trillium/massage/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/trillium/massage/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Trillium Massage Screen Shot][product-screenshot]](https://trilliummassage.la/)

Trillium Massage is a modern, responsive website for booking in-home massage therapy services in the Los Angeles Metro Area. The platform offers a seamless booking experience, integrated maps for service areas, customer reviews, and comprehensive admin tools for managing appointments and business operations.

Key features include:

- Online appointment booking with instant confirmation
- Interactive service area maps
- Customer review system
- Admin dashboard for business management
- Gmail calendar integration
- Mobile-responsive design
- Secure payment processing

The project aims to provide a professional, user-friendly experience for both clients and the massage therapist, streamlining the booking and management process.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

This project is built with modern web technologies:

- [![Next][Next.js]][Next-url] - React framework for production
- [![React][React.js]][React-url] - UI library
- [![TypeScript][TypeScript]][TypeScript-url] - Type-safe JavaScript
- [![Tailwind][Tailwind.css]][Tailwind-url] - Utility-first CSS framework
- [![MapLibre][MapLibre]][MapLibre-url] - Open-source maps
- [![PostHog][PostHog]][PostHog-url] - Product analytics
- [![Redux][Redux]][Redux-url] - State management
- [![Vitest][Vitest]][Vitest-url] - Testing framework

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (preferred package manager)
- Git

### Installation

1. Clone the repository

   ```sh
   git clone https://github.com/trillium/massage.git
   cd massage
   ```

2. Install dependencies

   ```sh
   pnpm install
   ```

3. Set up environment variables

   ```sh
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start the development server

   ```sh
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

The website provides a complete booking system for massage services:

- **For Clients**: Browse services, check availability, book appointments, leave reviews
- **For Admin**: Manage bookings, view analytics, handle customer inquiries

Key pages:

- `/` - Homepage with service overview
- `/book` - Appointment booking
- `/services` - Service details and pricing
- `/reviews` - Customer testimonials
- `/admin` - Administrative dashboard

_For detailed documentation, see the [Features Doc](docs/FEATURES.md)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [x] Core booking system
- [x] Admin dashboard
- [x] Gmail calendar integration
- [x] Customer reviews
- [x] Interactive maps
- [ ] PII removal

See the [open issues](https://github.com/trillium/massage/issues) for a full list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the code style guidelines in `AGENTS.md`
- Run tests before submitting: `pnpm test`
- Ensure linting passes: `pnpm lint`
- Use conventional commits

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Trillium Smith - trilliummassagela@gmail.com

Project Link: [https://github.com/trillium/massage](https://github.com/trillium/massage)
Live Site: [https://trilliummassage.la/](https://trilliummassage.la/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework used
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [MapLibre](https://maplibre.org/) - Open-source mapping
- [PostHog](https://posthog.com/) - Analytics platform
- [Best README Template](https://github.com/othneildrew/Best-README-Template) - Template inspiration

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/trillium/massage.svg?style=for-the-badge
[contributors-url]: https://github.com/trillium/massage/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/trillium/massage.svg?style=for-the-badge
[forks-url]: https://github.com/trillium/massage/network/members
[stars-shield]: https://img.shields.io/github/stars/trillium/massage.svg?style=for-the-badge
[stars-url]: https://github.com/trillium/massage/stargazers
[issues-shield]: https://img.shields.io/github/issues/trillium/massage.svg?style=for-the-badge
[issues-url]: https://github.com/trillium/massage/issues
[license-shield]: https://img.shields.io/github/license/trillium/massage.svg?style=for-the-badge
[license-url]: https://github.com/trillium/massage/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/trilliumsmith/
[product-screenshot]: /static/images/twitter-card.jpg
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[MapLibre]: https://img.shields.io/badge/MapLibre-000000?style=for-the-badge&logo=maplibre&logoColor=white
[MapLibre-url]: https://maplibre.org/
[PostHog]: https://img.shields.io/badge/PostHog-000000?style=for-the-badge&logo=posthog&logoColor=white
[PostHog-url]: https://posthog.com/
[Redux]: https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white
[Redux-url]: https://redux-toolkit.js.org/
[Vitest]: https://img.shields.io/badge/Vitest-646CFF?style=for-the-badge&logo=vitest&logoColor=white
[Vitest-url]: https://vitest.dev/</content>

<parameter name="filePath">/Users/trilliumsmith/code/massage/massage/docs/FEATURES.md
