require('dotenv').config();
const Sib = require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');          //used to create unique user id for sending to email for reset password
const uniqueId=uuidv4();  
const Forgot=require('../models/Forgot')
const signup=require('../models/User')
const bcrypt=require('bcryptjs');                 //for hashing password
const client = Sib.ApiClient.instance;
var apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY;
console.log(process.env.API_KEY);

const forgotPassword = async (req, res) => {
    try {
        console.log("hellllllllllllooooooooooooooo");
        console.log("Email received:", req.body.email);

        const tranEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: 'vsbrall143@gmail.com',
            name: 'Yourssssssssss' // Optional: Adds a sender name for better branding.
        };

        const receivers = [
            {
                email: req.body.email
            }
        ];

        const id=uniqueId;
        const signupEmail=req.body.email;
        const isActive=true;

        const data = await Forgot.create({id,isActive});
      
        const emailResponse = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: "Password Reset",
            textContent: `this is your password reset link \n\n"https://expense-tracker-mongo-t8fj.onrender.com/password/resetpassword/${uniqueId}" \n\nBest regards,\nCoding Team`,
            html:`<a href="https://expense-tracker-mongo-t8fj.onrender.com/password/resetpassword/${uniqueId}">Reset password</a>`,
        });

        console.log("Email sent successfully:", emailResponse);
        res.status(200).json({ message: "Email sent successfully", emailResponse });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
};

const resetPassword = async (req, res) => {
    try {
        console.log("reset link sent");
        const id = req.params.uuid;
        console.log("id");
        const forgotPasswordRequest = await Forgot.findOne({ where: { id } });
        console.log(forgotPasswordRequest);
        if (forgotPasswordRequest) {
            await forgotPasswordRequest.update({ isActive: false });
            res.status(200).send(`
                <html>
                    <script>
                        function formsubmitted(e) {
                            e.preventDefault();
                            console.log('called');
                        }
                    </script>

                    <form action="/password/updatepassword/${id}" method="get">
                        <label for="newpassword">Enter New Password:</label>
                        <input name="newpassword" type="password" required></input>
                        <button>Reset Password</button>
                    </form>
                </html>
            `);
        } else {
            res.status(404).json({ error: 'Invalid request', success: false });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', success: false });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        console.log(resetpasswordid);

        if (!newpassword) {
            return res.status(400).json({ error: 'Password is required', success: false });
        }

        const resetPasswordRequest = await Forgot.findOne({ where: { id: resetpasswordid } });
        if (!resetPasswordRequest) {
            return res.status(404).json({ error: 'Invalid reset request', success: false });
        }

        const user = await signup.findOne({ where: { email: resetPasswordRequest.signupEmail } });
        if (!user) {
            return res.status(404).json({ error: 'User not found', success: false });
        }

        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, async (err, salt) => {
            if (err) {
                console.error(err);
                throw new Error('Error generating salt');
            }

            bcrypt.hash(newpassword, salt, async (err, hash) => {
                if (err) {
                    console.error(err);
                    throw new Error('Error hashing password');
                }

                await signup.update({ password: hash }, { where: { email: user.email } });
                res.status(201).json({ message: 'Password updated successfully', success: true });

            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', success: false });
    }
};

 


 


module.exports = { forgotPassword , resetPassword , updatePassword};
