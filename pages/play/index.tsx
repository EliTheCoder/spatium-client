import { CheckIcon } from "@chakra-ui/icons";
import {
	Box,
	Center,
	Grid,
	HStack,
	IconButton,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Select,
	Skeleton,
	Tab,
	Table,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Tbody,
	Td,
	Th,
	Thead,
	Tr
} from "@chakra-ui/react";
import withRouter, { WithRouterProps } from "next/dist/client/with-router";
import React from "react";

class Play extends React.Component<WithRouterProps> {
	render() {
		return (
			<Grid templateColumns="repeat(2, 1fr)" p="100px" gap="100px">
				<RoomList />
				<RoomCreator />
			</Grid>
		);
	}
}

class RoomList extends React.Component {
	render() {
		return (
			<Center>
				<Box borderWidth="1px" borderRadius="lg" w="100%" h="100%">
					<Table variant="simple">
						<Thead>
							<Tr>
								<Th>Player</Th>
								<Th>Rating</Th>
								<Th>Time</Th>
								<Th>Mode</Th>
								<Th>Accept</Th>
							</Tr>
						</Thead>
						<Tbody>
							<SkeletonRoom />
							<SkeletonRoom />
							<SkeletonRoom />
							<SkeletonRoom />
						</Tbody>
					</Table>
				</Box>
			</Center>
		);
	}
}

type RoomProps = {
	name: string;
	rating: string;
	time: string;
	mode: string;
	id: string;
};

class Room extends React.Component<RoomProps> {
	name: string;
	rating: string;
	time: string;
	mode: string;
	id: string;
	constructor(props: RoomProps) {
		super(props);
		let { name, rating, time, mode, id } = props;
		this.name = name;
		this.rating = rating;
		this.time = time;
		this.mode = mode;
		this.id = id;
	}
	render() {
		return (
			<Tr>
				<Td>{this.name}</Td>
				<Td>{this.rating}</Td>
				<Td>{this.time}</Td>
				<Td>{this.mode}</Td>
				<Td>
					<IconButton
						aria-label="Accept"
						icon={<CheckIcon />}
						href={"/" + this.id}
					/>
				</Td>
			</Tr>
		);
	}
}

class SkeletonRoom extends React.Component {
	render() {
		return (
			<Tr>
				<Td>
					<Skeleton>Name</Skeleton>
				</Td>
				<Td>
					<Skeleton>Rating</Skeleton>
				</Td>
				<Td>
					<Skeleton>Time</Skeleton>
				</Td>
				<Td>
					<Skeleton>Mode</Skeleton>
				</Td>
				<Td>
					<Skeleton w="100%">
						<IconButton aria-label="Accept" icon={<CheckIcon />} />
					</Skeleton>
				</Td>
			</Tr>
		);
	}
}

class RoomCreator extends React.Component {
	render() {
		return (
			<Box borderWidth="1px" borderRadius="lg" w="100%" h="100%">
				<Tabs isFitted>
					<TabList>
						<Tab>Template</Tab>
						<Tab>Custom</Tab>
						<Tab>Challenges</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<TemplateRoomCreator />
						</TabPanel>
						<TabPanel>
							<p>two!</p>
						</TabPanel>
						<TabPanel>
							<p>three!</p>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>
		);
	}
}

class TemplateRoomCreator extends React.Component {
	render() {
		return (
			<Box>
				<Select mb="10px" placeholder="Select Mode" isFullWidth>
					<option>Standard</option>
					<option>4D Standard</option>
					<option>Antichess</option>
					<option>Atomic</option>
					<option>3D Standard</option>
				</Select>
				<HStack>
					<NumberInput w="50%">
						<NumberInputField placeholder="Starting Time (minutes)" />
						<NumberInputStepper>
							<NumberIncrementStepper />
							<NumberDecrementStepper />
						</NumberInputStepper>
					</NumberInput>
					<NumberInput w="50%">
						<NumberInputField placeholder="Additional Time (seconds)" />
						<NumberInputStepper>
							<NumberIncrementStepper />
							<NumberDecrementStepper />
						</NumberInputStepper>
					</NumberInput>
				</HStack>
			</Box>
		);
	}
}

export default withRouter(Play);
