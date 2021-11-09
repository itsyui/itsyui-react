import { SliderActions } from './actions';

const initialState = {
    slides: [],
    sliderProps: {},
    sliderEventProps: {}
};

function reducer(state, action) {
    switch (action.type) {
        case SliderActions.STATE.SLIDER_INIT:
        case SliderActions.STATE.SLIDER_LOAD:
        case SliderActions.STATE.SLIDER_STATE_UPDATE_COMPLETE:
            return {
                ...state,
                slides: action.slides,
                sliderProps: action.sliderProps
            };
        case SliderActions.STATE.SLIDER_ON_NEXT_COMPLETE:
        case SliderActions.STATE.SLIDER_ON_PREVIOUS_COMPLETE:
            return {
                ...state,
                sliderProps: action.sliderProps
            };
        default:
            return state === undefined ? initialState :
                Object.keys(state).length === 0 ? initialState : state;
    }
}

export default reducer;
