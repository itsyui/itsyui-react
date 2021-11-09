import { AppActions } from './actions';

const initialState = {
	schema: {},
	initialLocation: {},
	defaultURL: "",
	isUserLoggedIn: false,
	authState: {
		type: AppActions.AuthPageState.Init
	},
	isLoading: false,
	loadingMessage: "",
	currentURL: "",
	messageJson: {},
};

function reducer(state, action) {
	switch (action.type) {
		case AppActions.AppSchema:
			return {
				...state,
				schema: action.schema,
				initialLocation: action.initialLocation,
				defaultURL: action.defaultURL
			};
		case AppActions.UpdateMessageJson:
			return {
				...state,
				messageJson: action.jsonData,
			};
		case AppActions.UserAuthenticated:
			return {
				...state,
				isUserLoggedIn: action.isUserLoggedIn
			};
		case AppActions.AuthPageState.Login:
		case AppActions.AuthPageState.Home:
			return {
				...state,
				authState: {
					...state.authState,
					type: action.type
				}
			};
		case AppActions.NavigateURL:
			return {
				...state,
				currentURL: action.url
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;