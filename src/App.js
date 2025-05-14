import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Eye, EyeOff, User, Lock, Mail, ArrowRight } from 'lucide-react';
import './App.css'; // Import the CSS file
import { Amplify } from 'aws-amplify';
import { signIn } from 'aws-amplify/auth';
import { signUp } from 'aws-amplify/auth';
// import { defineAuth } from "@aws-amplify/backend"


Amplify.configure({
  Auth:{
    Cognito: {
      //  Amazon Cognito User Pool ID
      userPoolId: 'eu-north-1_LsFA5E1EB',
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId: '5c86lm2nbb4tul4f35mpi1kikl',
      // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
      // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
      signUpVerificationMethod: 'code', // 'code' | 'link'
      loginWith: {
        oauth: {
          domain: 'your_cognito_domain',
          scopes: [
            'phone',
            'email',
            'profile',
            'openid',
            'clientMetaData',
            'aws.cognito.signin.user.admin'
          ],
          redirectSignIn: ['http://localhost:3000/'],
          redirectSignOut: ['http://localhost:3000/'],
          responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
        }
      }
    }
  }
});

// export const auth = defineAuth({
//   loginWith: {
//     // this configures a required "email" attribute
//     email: true,
//   },
//   userAttributes: {
//     "custom:recaptchaToken": {
//       dataType: "String",
//       mutable: true,
//       maxLen: 500,
//       minLen: 1,
//     },
//   },
// })

export default function App() {
  // State management
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  // Handle Sign In
  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    const { username, password } = formData;
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { isSignedIn, nextStep } = await signIn({username, password},undefined,{'clientMetadata':recaptchaToken});
      setSuccess('Sign in successful!');
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    const { username, email, password, confirmPassword } = formData;
    
    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { isSignedUp, nextStep } = await signUp({
        username,
        password,
        attributes: {
          email
        }
      });
      setSuccess('Sign up successful! Please check your email for verification.');
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when switching between login and signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={toggleAuthMode}
              className="text-link"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {error && (
          <div className="auth-message error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="auth-message success">
            {success}
          </div>
        )}

        <div className="auth-form">
          <div className="form-fields">
            <div className="input-group">
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="input-icon">
                <User />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
              />
            </div>

            {!isLogin && (
              <div className="input-group">
                <label htmlFor="email" className="sr-only">Email</label>
                <div className="input-icon">
                  <Mail />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="input-icon">
                <Lock />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {!isLogin && (
              <div className="input-group">
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <div className="input-icon">
                  <Lock />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                />
              </div>
            )}

            <div className="recaptcha-container">
              <ReCAPTCHA
                sitekey="6Lfl9jcrAAAAAHykIKwNNi8CTxFrs60XS_5yzh1m"
                onChange={token => setRecaptchaToken(token)}
                theme="light"
                size="normal"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              disabled={isLoading}
              onClick={isLogin ? handleSignIn : handleSignUp}
              className="submit-button"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
                  <ArrowRight className="button-icon" />
                </>
              )}
            </button>
          </div>
        </div>

        {isLogin && (
          <div className="forgot-password">
            <button 
              type="button"
              className="text-link"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}