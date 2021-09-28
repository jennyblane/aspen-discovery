import React, { Component } from "react";
import { StyleSheet, ActivityIndicator, Alert, FlatList, Image, Platform, Text, TextInput, TouchableOpacity, View, Dimensions, Animated } from "react-native";
import { Center, NativeBaseProvider, Box, Spinner, HStack } from "native-base";
import ModalSelector from "react-native-modal-selector-searchable";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Avatar, ListItem } from "react-native-elements";
import ViewMoreText from "react-native-view-more-text";
import Stylesheet from "./Stylesheet";

export default class PlaceHold extends Component {
	constructor() {
		super();
		this.state = { isLoading: true };
	}

	authorSearch = (author) => {
		this.props.navigation.push("ListResults", { searchTerm: author });
	};

	// handles the mount information, setting session variables, etc
	componentDidMount = async () => {
		this.setState({
			isLoading: false,
			pathLibrary: await AsyncStorage.getItem("library"),
			pathUrl: await AsyncStorage.getItem("url"),
			password: await AsyncStorage.getItem("password"),
			pickUpLabel: await AsyncStorage.getItem("pickUpLabel"),
			pickUpLocation: await AsyncStorage.getItem("pickUpLocation"),
			screenHeight: 0,
			showSuccess: false,
			showFailure: false,
			username: await AsyncStorage.getItem("username"),
		});

		const pickuplocation =
			this.state.pathUrl + "/app/aspenPickUpLocations.php?library=" + this.state.pathLibrary + "&barcode=" + this.state.username + "&pin=" + this.state.password;

		// fetch valid pickup locations
		fetch(pickuplocation, {
			header: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			timeout: 5000,
		})
			.then((res) => res.json())
			.then(
				(res) => {
					this.setState({
						locations: res.pickup,
					});
				},
				(err) => {
					console.warn("Its borked! Unable to connect to the library. Attempted connecting to <" + pickuplocation + ">");
					console.warn("Error: ", err);
				}
			);
	};

	// handles the scrollability of the screen
	onContentSizeChange = (contentHeight) => {
		this.setState({ screenHeight: contentHeight });
	};

	// function that calls the external PHP script to put a hold on the item
	onPressItem = async (selectedItem) => {
		const random = new Date().getTime(); // included to ensure that we're pulling new information
		const url =
			this.state.pathUrl +
			"/app/aspenPlaceHold.php?library=" +
			this.state.pathLibrary +
			"&barcode=" +
			this.state.username +
			"&pin=" +
			this.state.password +
			"&item=" +
			selectedItem +
			"&location=" +
			this.state.pickUpLocation +
			"&rand=" +
			random;

		// fetches the information from the external URL
		fetch(url)
			.then((res) => res.json())
			.then((res) => {
				let holdStatus = res.data.hold.ok;
				let holdMessage = res.data.hold.message;

				// handle a failed renewal and then exit function
				if (holdStatus != "1") {
					this.setState({
						holdMessage: holdMessage,
						showFailure: true,
					});
					return "";
				}

				// we know that the renewal was successful at this point
				this.setState({ holdMessage: holdMessage, showSuccess: true });
			})
			.catch((error) => {
				console.log("get data error from:" + url + " error:" + error);
			});

		try {
			await AsyncStorage.setItem("pickUpLocation", this.state.pickUpLocation);
			await AsyncStorage.setItem("pickUpLabel", this.state.pickUpLabel);
		} catch (error) {}
	};

	// shows the author information on the screen and allows the link to be clickable. hides it if there is no author.
	showAuthor = (author) => {
		if (author) {
			return (
				<View>
					<TouchableOpacity onPress={() => this.authorSearch(author)}>
						<Text>By: {author}</Text>
					</TouchableOpacity>
				</View>
			);
		}
	};

	// shows the options for locations
	showLocationPulldown = () => {
		return (
			<View>
				<ModalSelector
					data={this.state.locations}
					keyExtractor={(item) => item.code}
					labelExtractor={(item) => item.displayName}
					initValue="Select your pick up location ▼"
					supportedOrientations={["landscape", "portrait"]}
					animationType="fade"
					accessible={true}
					scrollViewAccessibilityLabel={"Scrollable options"}
					cancelButtonAccessibilityLabel={"Cancel Button"}
					onChange={(option) => {
						this.setState({
							pickUpLabel: option.displayName,
							pickUpLocation: option.code,
						});
					}}
				>
					<Text>{"\n"}Preferred Pick Up Location:</Text>
					<TextInput editable={false} placeholder="Select your pick up location ▼" value={this.state.pickUpLabel} />
				</ModalSelector>
			</View>
		);
	};

	// renders the holdable items on the screen
	renderNativeItem = (item, image) => {
		return (
			<ListItem bottomDivider onPress={() => this.onPressItem(item.type)}>
				<Avatar rounded source={{ uri: image }} />
				<ListItem.Content>
					<ListItem.Title>{item.name}</ListItem.Title>
				</ListItem.Content>
				<ListItem.Chevron />
			</ListItem>
		);
	};

	// function that handles the read less functionality
	renderViewLess(onPress) {
		return (
			<Text style={Stylesheet.readMore} onPress={onPress}>
				View less
			</Text>
		);
	}

	// function that handles the read more functionality
	renderViewMore(onPress) {
		return (
			<Text style={Stylesheet.readMore} onPress={onPress}>
				View more
			</Text>
		);
	}

	// renders the screen
	render() {
		const getHeader = () => {
			return (
				<Box>
					{this.props.navigation.state.params.item.image ? (
						<Image style={Stylesheet.coverArtImage} source={{ uri: itemImage }} />
					) : (
						<Image style={Stylesheet.coverArtImage} source={itemImage} />
					)}

					<Text>{title}</Text>
					{this.showAuthor(author)}
					<Text>{bookSummary}</Text>

					{this.state.showSuccess || this.state.showFailure ? (
						<View>
							<TouchableOpacity onPress={() => this.props.navigation.goBack()}>
								{this.state.showSuccess ? (
									<Text>
										{this.state.holdMessage}
										{"\n\n"}Tap to close.
									</Text>
								) : null}
								{this.state.showFailure ? (
									<Text>
										{this.state.holdMessage}
										{"\n\n"}Tap to close.
									</Text>
								) : null}
							</TouchableOpacity>
						</View>
					) : null}

					<View>
						{this.showLocationPulldown()}
						<Text>Place a hold (choose format):</Text>
					</View>
				</Box>
			);
		};

		// renders the is loading loop until the system is ready with the data
		if (this.state.isLoading) {
			return (
				<Center flex={1}>
					<HStack>
						<Spinner accessibilityLabel="Loading..." />
					</HStack>
				</Center>
			);
		}

		// construct variables to make the displaying of information easier
		const title = this.props.navigation.state.params.item.title;
		const author = this.props.navigation.state.params.item.author;
		const bookSummary = this.props.navigation.state.params.item.summary;
		const itemList = this.props.navigation.state.params.item.itemList;
		const itemImage = this.props.navigation.state.params.item.image;

		return (
			<Center>
				<Box>
					<FlatList
						data={itemList}
						renderItem={({ item }) => this.renderNativeItem(item, itemImage)}
						keyExtractor={(item, index) => index.toString()}
						ListHeaderComponent={getHeader}
						showsVerticalScrollIndicator={false}
					/>
				</Box>
			</Center>
		);
	}
}