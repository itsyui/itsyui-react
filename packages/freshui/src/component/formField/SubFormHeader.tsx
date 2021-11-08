import { WidgetsFactory } from '@itsy-ui/core';
import { BsPlusCircle } from "react-icons/bs";

function SubFormHeader(props) {
    const { fieldSchema, onIconClick } = props.schema;
    return <>
        <label className={fieldSchema.readOnly ? "repeater-title label-disabled" : "repeater-title"}> {fieldSchema.displayName}</label>
        <BsPlusCircle onClick={() => onIconClick()} className={fieldSchema.readOnly ? "disableSubFormIcon" : ""} />
    </>
}

SubFormHeader["displayName"] = "SubFormHeader";

WidgetsFactory.instance.registerFactory(SubFormHeader);
WidgetsFactory.instance.registerControls({
    "subform_header_ui": "SubFormHeader",
    "itsy:form:subformheader": "SubFormHeader",
});