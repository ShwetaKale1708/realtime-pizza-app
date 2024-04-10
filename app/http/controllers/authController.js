const User=require('../../models/user')
const bcrypt=require('bcrypt')
const passport=require('passport')
const mongoose = require('mongoose'); 
const { body, validationResult, check}=require('express-validator')



function authController(){

const _getRedirectUrl=(req)=>{
    return req.user.role==='admin'? '/admin/orders':'/'
}

    // factory function=> returns object
    return{
        login(req,res){
            res.render('auth/login')
        },

        postLogin(req,res,next){
            const { email , password  }=req.body
            if(!email || !password){
                req.flash('error','All fields are required');
                req.flash('email',email)
                return res.redirect('/login')
            }
            passport.authenticate('local',(err,user,info)=>{
                if(err){
                    req.flash('error',info.message)
                    
                    return next(err)
                }
                if(!user){
                    req.flash('error',info.message)
                    
                    return res.redirect('/login')
                }
                req.logIn(user,(err)=>{
                    if(err){
                        req.flash('error',info.message)
                        
                        return next(err)
                    }
                    
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req,res,next)
        },

        register(req,res){
            res.render('auth/register')
        },
        async postRegister(req,res){
            const { name , email , password  }=req.body
            // this code is not running because we already specify the required validation on input element,if we remove that then the following code is working.
            if(!name || !email || !password){
                req.flash('error','All fields are required');
                req.flash('name',name)
                req.flash('email',email)
                return res.redirect('/register')
            }

            try{
                await check('email').isEmail().withMessage('Invalid email address').run(req)
                await check('name').isLength({ min: 3 }).withMessage('name should have atleast 3 characters').run(req)
                await check('password').isLength({ min: 8 }).withMessage('password should have atleast 8 characters.').run(req)
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
       
                    req.flash('error', errors.array()[0].msg);
                    req.flash('name',name)
                    req.flash('email',email)
                    return res.redirect('/register');
    }
                const result = await User.exists({email:email})
                if(result){
                    req.flash('error','Email already taken.')
                    req.flash('name',name)
                    req.flash('email',email)
                    return res.redirect('/register')
                }
               
            }
            catch (error) {
                
                
                // req.flash('error', 'An error occurred while checking the email.');
                return res.redirect('/register');
            }
           
                
           

            const hashedPassword=await bcrypt.hash(password,10)

            const user= new User({
                name,
                email,
                password:hashedPassword
            })
            user.save().then(user=>{
                return res.redirect('/login')
            }).catch(err=>{
                req.flash('error','Something went wrong')
                    
                    return res.redirect('/register')
            })
            
        },

        logout(req, res) {
            req.logOut(function(err) {
                if (err) {
                   
                    return res.status(500).send('Error logging out');
                }
                return res.redirect('/login');
            });
        }
    }
}

module.exports=authController