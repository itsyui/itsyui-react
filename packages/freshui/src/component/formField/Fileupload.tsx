import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import { BsX } from "react-icons/bs";
import { convertFileToBase64, getFileName, getlocaleText, getNewId, isImageBase64Content, isValidFileName } from "../../utils/helper";

function doUpdateFile(data: any) {
	return async (getState: any, dispatch: any, transition: any) => {
		dispatch({ type: "FILEPICKER_UPDATE", fileData: data });
	};
}
class FreshUiFileUpload extends React.Component<IWidgetControlProps, {}> {
	constructor(props) {
		super(props);
		this.state = {
			fileNames: [],
			id: "",
		};
	}

	componentWillMount() {
		const { value } = this.getControlSchemaProperties();
		this.setFileNamesInState(value);
	}

	setFileNamesInState(fileNames: any) {
		const validFileNames = [];
		if (Array.isArray(fileNames)) {
			fileNames.every(fileName => isValidFileName(fileName) ? validFileNames.push(fileName) : false);
		} else if (typeof (fileNames) === "string" && isValidFileName(fileNames)) {
			validFileNames.push(fileNames);
		}
		this.setState({ fileNames: validFileNames, id: getNewId() });
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	getFileNames(files: FileList) {
		return Array.from(files).map(t => t.name);
	}

	onChange(e: any, acceptFileTypes: any) {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		const { resultType, allowMultiple } = fieldSchema;
		acceptFileTypes = acceptFileTypes && acceptFileTypes.split(",");
		const files = e.target.files;
		let filesInBase64 = [];
		const fileExtensions = [];
		e.persist();
		if (resultType === "base64") {
			this.getExtensionsAndByte64ForFiles(files, fileExtensions, filesInBase64).then(() => {
				const isInvalidFile = !this.checkAllFiles(fileExtensions, acceptFileTypes) ? true : false;
				if (Array.isArray(acceptFileTypes) && acceptFileTypes.length > 0) {
					if (isInvalidFile) {
						const popupData = {
							popupMessage: `${getlocaleText(`{{fileUpload.AcceptFormat}}`)} ${acceptFileTypes}`,
							title: getlocaleText("{{fileUpload.Error}}"),
							popupType: 1,
							onOk: () => {
								this.props.transition({
									type: "HIDE_POPUP",
								});
							},
						};
						filesInBase64 = null;
						this.props.transition({
							type: "SHOW_POPUP",
							event: popupData,
						});
					}
				}
				this.props.onUpdateFile(isInvalidFile ? undefined : Array.from(files));
				const fileValue = !allowMultiple && Array.isArray(filesInBase64) && filesInBase64.length > 0 ? filesInBase64[0] : filesInBase64;
				controlProps.handleChange && controlProps.handleChange(e, fileValue);
			});
		} else {
			this.props.onUpdateFile(Array.from(files));
			controlProps.handleChange && controlProps.handleChange(e, Array.from(files));
		}
	}

	checkAllFiles(fileExtensions: any, acceptFileTypes: any) {
		if (Array.isArray(acceptFileTypes) && Array.isArray(fileExtensions) && fileExtensions.length > 0) {
			return fileExtensions.every(extension => {
				return acceptFileTypes.some((fType: string) => fType.trim().toLowerCase() === extension.toLowerCase() || `.${fType.trim().toLowerCase()}` === extension.toLowerCase());
			});
		}
		return true;
	}

	async getExtensionsAndByte64ForFiles(files: any, fileExtensions: any, filesInBase64: any) {
		if (files && Object.keys(files).length > 0 && Array.isArray(fileExtensions) && Array.isArray(filesInBase64)) {
			const fileNames = [];
			for (const key in files) {
				const file = files[key];
				if (typeof (file) === "object") {
					const filename = file.name;
					const filenameSplit = filename ? filename.split(".") : null;
					const fileExtension = Array.isArray(filenameSplit) && filenameSplit.length > 0 ? `.${filenameSplit[filenameSplit.length - 1]}` : "";
					const fileInBase64 = await convertFileToBase64(file);
					const fileBase64Split = typeof fileInBase64 === "string" ? fileInBase64.split(";") : [];
					const fileNameWithBase64 = fileBase64Split.length > 1 ? `${fileBase64Split[0]};${filename};${fileBase64Split[1]}` : fileBase64Split.toString();
					fileExtensions.push(fileExtension);
					filesInBase64.push(fileNameWithBase64);
					fileNames.push(filename);
				}
			}
			this.setState({ fileNames: fileNames });
		}
	}

	getAcceptType = (acceptType) => {
		if (process.env.MODE === "tablet") {
			return typeof acceptType === "string" ? acceptType.split(",").map(t => t.split(".")[1]).join() : acceptType;
		}
		return typeof acceptType === "string" ? acceptType.split(",").map(t => t.trim().startsWith(".") ? t : "." + t.trim()) : acceptType;
	}

	onDeleteFiles = async (deletedFile: any) => {
		const { fileData } = this.props;
		const controlProps = this.getControlSchemaProperties();
		const base64Data = [];
		const updatedFiles = fileData.filter(t => t.name !== deletedFile.name);
		for (const key in updatedFiles) {
			const file = updatedFiles[key];
			const fileInBase64 = await convertFileToBase64(file);
			const fileBase64Split = typeof fileInBase64 === "string" ? fileInBase64.split(";") : [];
			const fileNameWithBase64 = fileBase64Split.length > 1 ? `${fileBase64Split[0]};${file.name};${fileBase64Split[1]}` : fileBase64Split.toString();
			base64Data.push(fileNameWithBase64);
		}
		this.props.onUpdateFile(updatedFiles);
		controlProps.handleChange(undefined, base64Data);
	}

	renderChipsFromFileObject = (fileData: any[]) => {
		return <div className="file-chips">{
			fileData.map((t, i) => <Badge key={i}>{t.name}</Badge>)
		}
		</div>;
	}

	renderImagePreviewFromBase64 = (value: any, fileData?: any[]) => {
		const fileContents = Array.isArray(value) ? [...value] : [value];
		return fileContents.map((fContent: any) => {
			const fileName = getFileName(fContent);
			const fData = Array.isArray(fileData) ? fileData.find(f => f.name === fileName) : null;
			if (isImageBase64Content(fileName)) {
				return <div className="file-image-container" tabIndex={0}>
					<img src={fContent} className="file-image" tabIndex={0} alt={fileName} title={fileName} />
					{fData && <span onClick={() => this.onDeleteFiles(fData)} className="image-close-icon" tabIndex={0}>
						<BsX />
					</span>}
				</div>;
			}
			return <Badge className="filename-chip" {...fData && { onDelete: () => this.onDeleteFiles(fData) }}>{fileName}</Badge>;
		});
	}

	renderChips = () => {
		const { fileData } = this.props;
		const { fieldSchema, value } = this.getControlSchemaProperties();
		if (fileData && fileData.length > 0) {
			if (fieldSchema.resultType === "base64") {
				return value ? this.renderImagePreviewFromBase64(value, fileData) : null;
			}
			return this.renderChipsFromFileObject(fileData);
		} else if (value) {
			if (fieldSchema.resultType === "base64") {
				return this.renderImagePreviewFromBase64(value);
			} else {
				const fileContents = Array.isArray(value) ? [...value] : [value];
				return <div className="file-chips" tabIndex={0}>{
					fileContents.map((fname, index) => <Badge key={index} className="filename-chip" tabIndex={0} aria-label={fname}>{fname}</Badge>)
				}
				</div>;
			}
		}
	}

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		const acceptFileTypes = Array.isArray(fieldSchema.acceptFileTypes) ? fieldSchema.acceptFileTypes.join() : fieldSchema.acceptFileTypes;
		const customClass = fieldSchema.className ? fieldSchema.className : "";
		const customStyle = fieldSchema.style ? fieldSchema.style : {};
		return (
			<>
				<div className={`File_Upload_Control ${customClass}`} style={customStyle} tabIndex={0}>
					<input
						accept={this.getAcceptType(acceptFileTypes)}
						style={{
							display: "none",
						}}
						id={this.state.id}
						multiple={fieldSchema.allowMultiple === undefined ? false : fieldSchema.allowMultiple}
						type="file"
						onChange={(e) => {
							this.onChange(e, acceptFileTypes);
						}}
						disabled={fieldSchema.readOnly}
						tabIndex={0}
					/>
					<label className="file-upload-button-container btn btn-primary" tabIndex={0} aria-label={getlocaleText(fieldSchema.displayName)} htmlFor={this.state.id}>
						{getlocaleText(fieldSchema.displayName)}
					</label>

					{fieldSchema.showFile ? this.renderChips() : null}
					{controlProps.error && <div className="ant-alert ant-alert-error" tabIndex={0} aria-label={controlProps.error}>
						<i className="anticon anticon-cross-circle ant-alert-icon"></i>
						<span className="ant-alert-message">{controlProps.error}</span>
					</div>}
				</div>
				{fieldSchema.helptext && <Form.Text tabIndex={0} aria-label={getlocaleText(fieldSchema.helptext)}>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
			</>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onUpdateFile: (fileData) => dispatch(doUpdateFile(fileData)),
	};
};
const initialState = {

};
function reducer(state: any, action: any) {
	switch (action.type) {
		case "FILEPICKER_UPDATE":
			return {
				...state,
				fileData: action.fileData ? action.fileData : undefined,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

const FileUploadComponent = withReducer("FreshUiFileUpload", reducer, mapDispatchToProps)(FreshUiFileUpload);
FileUploadComponent.displayName = "FreshUiFileUpload";

WidgetsFactory.instance.registerFactory(FileUploadComponent);
WidgetsFactory.instance.registerControls({
	fileupload: "FreshUiFileUpload",
	"itsy:form:fileupload": "FreshUiFileUpload"
});

export default FreshUiFileUpload;
