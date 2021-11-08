import { FilterbarActions } from "./actions";

const initialState = {
    formSchema: {},
    filterContextPath: {},
    filters: {},
    chips: {},
};

function reducer(state, action) {
    switch (action.type) {
        case FilterbarActions.LOAD_SCHEMA:
            return {
                ...state,
                formSchema: action.formSchema,
                operation: action.operation,
                filters: action.filters,
                filterContextPath: action.filterContextPath,
            };
        case FilterbarActions.UPDATE_FILTERBAR:
            return {
                ...state,
                filters: action.filters,
                chips: action.chips,
            };
        default:
            return state === undefined ? initialState :
                Object.keys(state).length === 0 ? initialState : state;
    }
}

export default reducer;
