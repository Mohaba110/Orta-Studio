import "@fontsource-variable/manrope";
import "@/app/globals.css";
import "@/app/brand-theme.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { LocaleProvider } from "@/components/locale-provider";

export default function App({ Component, pageProps }: AppProps) {
  return <LocaleProvider><Head><title>ORTA Studio — Industrial Packaging &amp; Graphic Design</title><meta name="description" content="Industrial food packaging, labels and print-ready artwork built for real manufacturing." /></Head><Component {...pageProps} /></LocaleProvider>;
}
