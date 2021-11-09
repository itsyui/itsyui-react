
import { NotificationAction } from "./actions"
const initialState = {

};

function reducer(state, action) {
	switch (action.type) {
		case NotificationAction.showNotification:
			return {
				...state,
				...action,
			};
		case NotificationAction.hideNotification:
			return {
				...state,
				visibility: action.visibility
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;