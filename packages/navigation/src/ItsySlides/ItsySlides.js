import React, { useState, useEffect } from 'react';
import { WidgetsFactory, withReducer, getDefaultRegistry, retrieveSchema, SchemaContainer, useTransition } from "@itsy-ui/core";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { doSliderInit, doSliderOnNext, doSliderOnPrevious, doSliderStateUpdate, doSliderGetState, SliderActions, doSliderLoad, doSliderOnNextComplete, doSliderOnPreviousComplete, doSliderStateUpdateComplete } from "./actions";
import reducer from "./reducer";
// import Swiper core and required modules
import SwiperCore, { Navigation, Pagination } from 'swiper';
import "swiper/swiper.esm";
import 'swiper/swiper-bundle.esm';
import 'swiper/swiper.min.css';
import 'swiper/components/navigation/navigation.min.css';
import 'swiper/components/pagination/pagination.min.css';

import stateJSON from "./state.json";

// install Swiper modules
SwiperCore.use([Navigation, Pagination]);

function ItsySlides(props) {
    const [state, transition] = useTransition("ItsySlides", reducer, mapDispatchToProps, stateJSON);

    useEffect(() => {
        const schema = getControlSchemaProperties(props);
        transition({ type: SliderActions.STATE.SLIDER_INIT, slides: schema.slides, sliderProps: props.schema });
    }, []);

    const slidesList = state.slides ? state.slides.map(function (schema) {
        return <SwiperSlide>{schema}</SwiperSlide>;
    }) : [];

    const sliderProps = state.sliderProps ? state.sliderProps : props.schema

    return <Swiper {...sliderProps} onSlideNextTransitionStart={(data) => onSlideNextTransitionStart(data, transition)}
        onSlidePrevTransitionStart={(data) => onSlidePrevTransitionStart(data, transition)} >
        {slidesList}
    </Swiper>;
}

function onSlideNextTransitionStart(data, transition) {
    transition({ type: SliderActions.STATE.SLIDER_ON_NEXT, sliderEventProps: data })
}

function onSlidePrevTransitionStart(data, transition) {
    transition({ type: SliderActions.STATE.SLIDER_ON_PREVIOUS, sliderEventProps: data })
}

const getControlSchemaProperties = (props) => {
    const registry = getDefaultRegistry();
    const { definitions } = registry;
    const schema = retrieveSchema(props.schema, definitions);
    return schema;
};

const mapDispatchToProps = (dispatch) => {
    return {
        onSliderInit: (evt) => dispatch(doSliderInit(evt)),
        onSliderLoad: (evt) => dispatch(doSliderLoad(evt)),
        onSliderOnNext: (evt) => dispatch(doSliderOnNext(evt)),
        onSliderOnNextComplete: (evt) => dispatch(doSliderOnNextComplete(evt)),
        onSliderOnPrevious: (evt) => dispatch(doSliderOnPrevious(evt)),
        onSliderOnPreviousComplete: (evt) => dispatch(doSliderOnPreviousComplete(evt)),
        onSliderStateUpdate: (evt) => dispatch(doSliderStateUpdate(evt)),
        onSliderStateUpdateComplete: (evt) => dispatch(doSliderStateUpdateComplete(evt)),
        onSliderGetState: (evt) => dispatch(doSliderGetState(evt))
    }
};


ItsySlides.displayName = 'ItsySlides';

WidgetsFactory.instance.registerFactory(ItsySlides);
WidgetsFactory.instance.registerControls({
    itsySlides: "ItsySlides"
});