/* eslint-disable */
import { TabsActions } from './actions';

const initialState = {
	tabs: [],
	activeKey: null
};

function reducer(state, action) {
	switch (action.type) {
		case TabsActions.LoadData:
			return {
				...state,
				tabs: action.newItem,
				activeKey: Array.isArray(action.newItem) && action.newItem.length > 0 ? action.newItem[0].key : null
			};
		case TabsActions.NewTab:
			return {
				...state,
				tabs: action.tabs,
				activeKey: action.activeKey
			};
		case TabsActions.UpdateActiveTabsKey:
			return {
				...state,
				activeKey: action.activeKey
			};
		case TabsActions.RemoveTab:
			return {
				...state,
				tabs: action.tabs,
				activeKey: action.activeKey
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;