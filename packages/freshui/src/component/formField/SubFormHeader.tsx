import { WidgetsFactory } from '@itsy-ui/core';
import { BsPlusCircle } from "react-icons/bs";

function SubFormHeader(props) {
    const { fieldSchema, onIconClick } = props.schema;
    return <>
        <label className={fieldSchema.readOnly ? "repeater-title label-disabled" : "repeater-title"} tabIndex={0} aria-label={fieldSchema.displayName}> {fieldSchema.displayName}</label>
        <BsPlusCircle tabIndex={0} onClick={() => onIconClick()} className={fieldSchema.readOnly ? "disableSubFormIcon" : ""} />
    </>
}

SubFormHeader["displayName"] = "SubFormHeader";

WidgetsFactory.instance.registerFactory(SubFormHeader);
WidgetsFactory.instance.registerControls({
    "subform_header_ui": "SubFormHeader",
    "itsy:form:subformheader": "SubFormHeader",
});