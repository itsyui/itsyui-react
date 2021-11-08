export const defaultSignupSchema = {
	"name": "signup_page",
	"properties": {
		"ui:widget": "signup",
		"header": "Signup Form",
		"typeId": "fv:signup",
		"isModal": true,
		"formSchema": {
			"id": "signup_form",
			"displayName": "Signup Form",
			"propertyDefinitions": {
				"fv:companyName": {
					"id": "fv:companyName",
					"displayName": "{{signup.name}}",
					"placeholderText": "Enter Company Name",
					"required": true,
					"type": "string",
					"propertyType": "string",
					"ui:widget": "string",
					"variant": "outlined"
				},
				"fv:companyEmail": {
					"id": "fv:companyEmail",
					"displayName": "{{signup.Email}}",
					"placeholderText": "Enter Company Email",
					"required": true,
					"type": "email",
					"propertyType": "string",
					"ui:widget": "string",
					"variant": "outlined"
				},
				"fv:PhoneNumber": {
					"id": "fv:PhoneNumber",
					"displayName": "{{signup.mobileNumber}}",
					"placeholderText": "Enter Phone Number",
					"propertyType": "string",
					"ui:widget": "string",
					"variant": "outlined"
				},
			},
		},
	},
};

export const defaultUserVerificationSchema = {
	"name": "signup_verification_page",
	"properties": {
		"ui:widget": "confirmation",
		"header": "User Verification",
		"typeId": "fv:signupVerification",
		"formSchema": {
			"id": "signupVerification",
			"displayName": "Signup Verification",
			"propertyDefinitions": {
				"fv:email": {
					"id": "fv:email",
					"displayName": "{{userName}}",
					"placeholderText": "Enter User Name",
					"required": true,
					"type": "email",
					"propertyType": "string",
					"ui:widget": "string",
					"variant": "outlined"
				},
				"fv:confirmationCode": {
					"id": "fv:confirmationCode",
					"displayName": "{{confirmationCode}}",
					"placeholderText": "Enter 6 digit Confirmation Code",
					"required": true,
					"type": "password",
					"propertyType": "string",
					"ui:widget": "string",
					"variant": "outlined"
				},
				"fv:password": {
					"id": "fv:password",
					"displayName": "{{password}}",
					"placeholderText": "Enter password",
					"required": true,
					"type": "password",
					"propertyType": "string",
					"ui:widget": "string",
					"variant": "outlined"
				},
			},
		},
	},
};
export const defaultLoginSchema = {
	"name": "login_page",
	"properties": {
		"ui:widget": "login",
		"formSchema": {
			"id": "login_form",
			"displayName": "Login Form",
			"propertyDefinitions": {
				"userName": {
					"id": "userName",
					"displayName": "{{userName}}",
					"placeholderText": "Enter User name",
					"propertyType": "string",
					"required": true,
					"ui:widget": "text",
					"type": "email",
					"variant": "outlined"
				},
				"password": {
					"id": "password",
					"displayName": "{{password}}",
					"placeholderText": "Enter Password",
					"propertyType": "string",
					"required": true,
					"ui:widget": "text",
					"type": "password",
					"variant": "outlined"
				},
			},
		},
	},
};

export const defaultForgotPasswordSchema = {
	"name": "forgot_password_page",
	"properties": {
		"ui:widget": "forgot_password",
		"header": "Forgot Password",
		"typeId": "fv:forgotPassword",
		"formSchema": {
			"id": "forgot_password",
			"displayName": "Forgot Password",
			"propertyDefinitions": {
				"fv:email": {
					"id": "fv:email",
					"displayName": "{{userName}}",
					"placeholderText": "Enter registered email",
					"required": true,
					"type": "email",
					"propertyType": "string",
					"ui:widget": "string",
					"variant": "outlined"
				},
			},
		},
	},
};