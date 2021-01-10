import { Button, Center, Input } from "@chakra-ui/react";
import * as React from "react";
import { withRouter } from "next/router";
import { WithRouterProps } from "next/dist/client/with-router";

class Home extends React.Component<WithRouterProps> {
	state: { value: string };
	constructor(props: WithRouterProps) {
		super(props);
		this.state = { value: "" };
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}
	handleSubmit() {
		window.localStorage.username = this.state.value;
		this.props.router.push("/play");
	}
	handleChange(event: React.FormEvent) {
		this.setState({ value: (event.target as HTMLInputElement).value });
	}
	handleKeyPress(event: React.KeyboardEvent) {
		if (event.key == "Enter") {
			this.handleSubmit();
		}
	}
	render() {
		return (
			<Center>
				<Input
					placeholder="Username"
					w="50%"
					onChange={this.handleChange}
					onKeyPress={this.handleKeyPress}
				></Input>
				<Button onClick={this.handleSubmit}>Start</Button>
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
			</Center>
		);
	}
}

export default withRouter(Home);
