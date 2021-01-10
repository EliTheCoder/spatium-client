import { Box, Center, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import withRouter, { WithRouterProps } from "next/dist/client/with-router";
import React from "react";

class Play extends React.Component<WithRouterProps> {
	render() {
		return (
			<Center p="5%">
				<Box borderWidth="1px" borderRadius="lg" w="50%" h="50%" m="5%">
					<Table variant="simple">
						<Thead>
							<Tr>
								<Th>Player</Th>
								<Th>Rating</Th>
								<Th>Time</Th>
								<Th>Mode</Th>
							</Tr>
						</Thead>
						<Tbody>
							<Tr>
								<Td>EliTheCoder</Td>
								<Td>776</Td>
								<Td>10+0</Td>
								<Td>Custom</Td>
							</Tr>
							<Tr>
								<Td>AlexCheese</Td>
								<Td>1072</Td>
								<Td>2+1</Td>
								<Td>Standard</Td>
							</Tr>
							<Tr>
								<Td>Huday</Td>
								<Td>803</Td>
								<Td>10+0</Td>
								<Td>4D Standard</Td>
							</Tr>
						</Tbody>
					</Table>
					<style global jsx>{`
						html,
						body,
						body > div:first-child,
						div#__next,
						div#__next > div,
						div#__next > div > div {
							height: 100%;
						}
					`}</style>
				</Box>
			</Center>
		);
	}
}

export default withRouter(Play);
