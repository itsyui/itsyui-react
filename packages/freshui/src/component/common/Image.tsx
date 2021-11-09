import * as React from "react";
import { WidgetsFactory, getDefaultRegistry, retrieveSchema } from "@itsy-ui/core";

class ImageControl extends React.Component {
    _getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }

    render() {
        const { loaded, onClick, imgSrc, image_width, image_height, className, style } = this._getControlSchemaProperties();
        const customClass = className ? className : "";
        const customStyle = style ? { ...style } : {};
        return loaded ? <img className={customClass} style={customStyle} src={imgSrc} width={image_width} height={image_height} onClick={onClick} alt="image" /> : <span className="img-loading-text">Loading image</span>
    }
}

ImageControl["displayName"] = "ImageUIControl";

WidgetsFactory.instance.registerFactory(ImageControl);
WidgetsFactory.instance.registerControls({
    "itsy:ui:image": "ImageUIControl",
});
