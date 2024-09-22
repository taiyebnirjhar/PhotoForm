# Photo Form

Photo Form is a web application designed to help users easily create professional, suited-up photos. With just a few clicks, users can remove backgrounds, adjust image size and background, and add formal elements like suits to create a polished, professional photo. This project is currently an MVP with limited features but serves as a foundation for further development.

![Photo Form Preview](./public/mvp-overview.jpg) <!-- Replace with the correct path to the preview image -->

## Live Site

Check out the live version of the application here: [Photo Form](https://photoform.bblockdigital.com)

## Features

- **Background Removal:** Easily remove the background from any uploaded image.
- **Image Adjustments:** Adjust image size, position, and apply custom backgrounds.
- **Element Integration:** Add formal elements like suits to create a professional look.
- **Customizable Backgrounds:** Choose from a selection of predefined backgrounds or upload your own.
- **Screen Size Selection:** Adjust the output photo to various screen sizes, including desktop, tablet, and mobile.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **File Handling:** [Sharp](https://sharp.pixelplumbing.com/)
- **Image Processing:** [html2canvas](https://html2canvas.hertzen.com/), [file-saver](https://github.com/eligrey/FileSaver.js/), [rapid API for background removal](https://rapidapi.com/objectcut.api/api/background-removal)
- **UI Components:** [Radix UI](https://www.radix-ui.com/), [React Color](https://casesandberg.github.io/react-color/), [rc-slider](https://slider.react-component.now.sh/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

## Getting Started

To get started with the development environment, clone this repository and install the dependencies.

```bash
git clone https://github.com/yourusername/photo-form.git
cd photo-form
npm install
```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

### Open http://localhost:3000 with your browser to see the result.

### Building for Production

To create an optimized production build:

```bash
npm run build
npx serve -s dist -l 3000
```
