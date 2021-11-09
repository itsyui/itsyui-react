/* eslint-disable */
import { TabItemsActions } from './actions';

const initialState = {
	data: [],
	activeKey: null
};

function reducer(state, action) {
	switch (action.type) {
		case TabItemsActions.Actions.LoadData:
			return {
				...state,
				data: action.data,
				activeKey: action.activeKey
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;