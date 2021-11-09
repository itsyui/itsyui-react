import { WidgetsFactory, SchemaContainer } from "@itsy-ui/core";
import { SSL_OP_LEGACY_SERVER_CONNECT } from "constants";
import React from "react";
import { getWidgetSchema } from "./commandUtils";

export const SliderActions = {
    WIDGETTYPE: {
        FORM: "form",
        CUSTOM: "custom",
        PAGE: "r"
    },
    STATE: {
        FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
        SLIDER_INIT: "SLIDER_INIT",
        SLIDER_ON_NEXT: "SLIDER_ON_NEXT",
        SLIDER_ON_NEXT_COMPLETE: "SLIDER_ON_NEXT_COMPLETE",
        SLIDER_ON_PREVIOUS: "SLIDER_ON_PREVIOUS",
        SLIDER_ON_PREVIOUS_COMPLETE: "SLIDER_ON_PREVIOUS_COMPLETE",
        SLIDER_STATE_UPDATE: "SLIDER_STATE_UPDATE",
        SLIDER_STATE_UPDATE_COMPLETE: "SLIDER_STATE_UPDATE_COMPLETE",
        SLIDER_GET_STATE: "SLIDER_GET_STATE",
        SLIDER_LOADED: "SLIDER_LOADED",
        SLIDER_LOAD: "SLIDER_LOAD"
    },
};

export function doSliderInit(_evt: any) {
    return async (_: any, dispatch: any, transition: any) => {
        const _dispatch = dispatch;
        const slides = _evt.slides;
        const widgetSlides = getWidgetSchema(slides, transition);

        const schemaSlides = widgetSlides.map((schema) => {
            return <SchemaContainer schema={schema.controlSchema} />
        })

        transition({
            type: SliderActions.STATE.SLIDER_LOAD,
            slides: schemaSlides,
            sliderProps: _evt.sliderProps
        });
    };
}

export function doSliderLoad(_evt: any) {
    return async (_: any, dispatch: any, transition: any) => {

        dispatch({
            type: SliderActions.STATE.SLIDER_LOAD,
            slides: _evt.slides,
            sliderProps: _evt.sliderProps
        });
        transition({
            type: SliderActions.STATE.SLIDER_LOADED
        })
    };
}

export function doSliderOnNext(_evt: any) {
    return async (getState: any, dispatch: any, transition: any) => {
        const _dispatch = dispatch;
        const state = getState();
        transition({
            type: SliderActions.STATE.SLIDER_ON_NEXT_COMPLETE,
            sliderProps: state.sliderProps
        })
    };
}

export function doSliderOnNextComplete(_evt: any) {
    return async (_: any, dispatch: any, transition: any) => {
        dispatch({
            type: SliderActions.STATE.SLIDER_ON_NEXT_COMPLETE,
            sliderProps: _evt.sliderProps
        });
        transition({
            type: SliderActions.STATE.SLIDER_LOADED
        })
    };
}

export function doSliderOnPrevious(_evt: any) {
    return async (getState: any, dispatch: any, transition: any) => {
        const _dispatch = dispatch;
        const state = getState();
        transition({
            type: SliderActions.STATE.SLIDER_ON_PREVIOUS_COMPLETE,
            sliderProps: state.sliderProps
        })
    };
}

export function doSliderOnPreviousComplete(_evt: any) {
    return async (_: any, dispatch: any, transition: any) => {

        dispatch({
            type: SliderActions.STATE.SLIDER_ON_PREVIOUS_COMPLETE,
            sliderProps: _evt.sliderProps
        });

        transition({
            type: SliderActions.STATE.SLIDER_LOADED,
        })
    };
}

export function doSliderStateUpdate(_evt: any) {
    return async (getState: any, dispatch: any, transition: any) => {
        const _dispatch = dispatch;
        const state = getState();
        transition({
            type: SliderActions.STATE.SLIDER_STATE_UPDATE_COMPLETE,
            sliderProps: state.sliderProps,
            slides: state.slides
        })
    };
}

export function doSliderStateUpdateComplete(_evt: any) {
    return async (_: any, dispatch: any, transition: any) => {
        dispatch({
            type: SliderActions.STATE.SLIDER_STATE_UPDATE_COMPLETE,
            sliderProps: _evt.sliderProps,
            slides: _evt.slides
        });
        transition({
            type: SliderActions.STATE.SLIDER_LOADED
        })
    };
}

export function doSliderGetState(_evt: any) {
    return async (getState: any, dispatch: any, transition: any) => {
        const _dispatch = dispatch;
        const { onData } = _evt;
        transition({
            type: SliderActions.STATE.SLIDER_LOADED
        })
        const gridState = getState();
		onData.call(null, gridState);
    };
}


