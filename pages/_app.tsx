import type { AppProps } from "next/app";
import "../styles/globals.css";
import { ChakraProvider, extendTheme, CSSReset } from "@chakra-ui/react";

const config = {
	useSystemColorMode: false,
	initialColorMode: "dark"
};

const customTheme = extendTheme({ config });

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={customTheme}>
			<CSSReset />
			<Component width="100%" height="100%" {...pageProps} />
		</ChakraProvider>
	);
}

export default MyApp;
