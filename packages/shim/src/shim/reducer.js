import { MobileShimActions } from "./actions";
const initialState = {
	data: ""
};

function reducer(state, action) {
	switch (action.type) {
		case MobileShimActions.MobileUpdateNetworkStatus:
			return {
				...state,
				networkConnected: action.isConnected,
				networkType: action.connectionType,
			};
		case MobileShimActions.MobileAppState:
			return {
				...state,
				AppActive: action.isAppActive,
			};
		case MobileShimActions.MobileUpdateQRStatus:
			return {
				...state,
				isQREnabled: action.isQREnabled,
				bodyStyle: action.bodyStyle ? action.bodyStyle : state.bodyStyle
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;