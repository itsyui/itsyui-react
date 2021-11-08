import { PageWidgetActions } from "./actions";

const initialState = {
	pages: {},
	currentPage: null,
	objectData: undefined,
	urlParams: null,
	pagesPath: null,
	loaded: false
};

function reducer(state, action) {
	switch (action.type) {
		case PageWidgetActions.LoadPage:
			return {
				...state,
				pages: action.pages,
				currentPage: action.currentPage,
				objectData: action.objectData,
				urlParams: action.urlParams,
				pagesPath: action.pagesPath,
				loaded: true
			};
		case PageWidgetActions.UpdateContextObjectData:
			return {
				...state,
				objectData: action.objectData
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;