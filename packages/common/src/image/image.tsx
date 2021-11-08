import React, { Component } from "react";
import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer, DataLoaderFactory, IDataSourceLake } from "@itsy-ui/core";
import { getUrlParamValue } from "@itsy-ui/utils";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

const ImageType = {
    ObjectId: "ObjectId"
}

interface ImageWidgetProps {
    schema: Object;
    onClick?: (schema: Object) => void;
    className?: string;
    style?: Object;
}

interface ImageWidgetStateProps {
    imgSrc?: string;
    loaded?: boolean;
    onLoadData?: (schema) => void;
}

const initialState = {
    imgSrc: null,
    loaded: false
};

const Actions = {
    LoadData: "Image.LoadData",
};

function reducer(state, action) {
    switch (action.type) {
        case Actions.LoadData:
            return {
                ...state,
                imgSrc: action.imgSrc,
                loaded: action.loaded
            };
        default:
            return state === undefined ? initialState :
                Object.keys(state).length === 0 ? initialState : state;
    }
}

function doLoadData(schema: any) {
    return async (_getState, dispatch, _transition) => {
        const { image_type, image_value, image_datasource, image_typeId, image_id } = schema;
        const datasourceKey = image_datasource !== undefined ? image_datasource : "datasource";
        const dataSource: any = dataLoader.getLoader(datasourceKey);
        let objectId = getUrlParamValue("objectId");
        objectId = image_id ? image_id : objectId;
        let imgStr;
        if (image_type && image_type === ImageType.ObjectId) {
            if (objectId !== undefined && objectId !== null && objectId != "") {
                if (image_value !== undefined) {
                    const record = await dataSource.getObject(image_typeId, objectId);
                    imgStr = record ? record[image_value] : null;
                    return imgStr;
                } else {
                    const ds = image_datasource ? dataSource.session : dataSource;
                    const response = await ds.getContentStream(objectId, "inline");
                    if (response) {
                        const streamReader = response.body.getReader();
                        let baseString = [];
                        imgStr = await streamReader.read().then(function processData({ done, value }) {
                            if (value !== undefined) {
                                baseString = [...baseString, ...value];
                            }
                            if (done) {
                                const completeString = new Buffer(baseString).toString('base64');
                                return completeString;
                            }
                            return streamReader.read().then(processData);
                        });
                    }
                    return imgStr ? `data:image/jpeg;base64,${imgStr}` : "";
                }
            }
        } else {
            imgStr = image_value ? image_value : null;
        }
        dispatch({
            type: Actions.LoadData,
            imgSrc: imgStr,
            loaded: true
        })
    };
}

type ImageProps = ImageWidgetProps & ImageWidgetStateProps;

class ImageWidget extends Component<ImageProps> {
    getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }

    componentDidMount() {
        this.props.onLoadData(this.props.schema);
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.schema);
        }
    }

    render() {
        const schema = this.props.schema ? this.props.schema : {};
        const imgUISchema = {
            name: `img_ui_control`,
            properties: {
                ...schema,
                imgSrc: this.props.imgSrc,
                loaded: this.props.loaded,
                "ui:widget": "itsy:ui:image",
                onClick: this.onClick.bind(this),
                className: this.props.className,
                style: this.props.style
            },
        };
        return (<SchemaContainer schema={imgUISchema} />);
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onLoadData: (schema) => dispatch(doLoadData(schema))
    };
};

const ImageWidgetComponent = withReducer("Image", reducer, mapDispatchToProps)(ImageWidget);
ImageWidgetComponent["displayName"] = "Image";

WidgetsFactory.instance.registerFactory(ImageWidgetComponent);
WidgetsFactory.instance.registerControls({
    image_control: "Image",
    "itsy:image": "Image",
});

export default ImageWidgetComponent;

