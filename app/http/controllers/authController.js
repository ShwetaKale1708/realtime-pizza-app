const User=require('../../models/user')
const bcrypt=require('bcrypt')
const passport=require('passport')
const mongoose = require('mongoose'); 

function authController(){

const _getRedirectUrl=(req)=>{
    return req.user.role==='admin'? '/admin/orders':'/customer/orders'
}

    // factory function=> returns object
    return{
        login(req,res){
            res.render('auth/login')
        },

        postLogin(req,res,next){
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
            // if(!name || !email || !password){
            //     req.flash('error','All fields are required');
            //     req.flash('name',name)
            //     req.flash('email',email)
            //     return res.redirect('/register')
            // }

            try{
                const result = await User.exists({email:email})
                if(result){
                    req.flash('error','Email already taken.')
                    req.flash('name',name)
                    req.flash('email',email)
                    return res.redirect('/register')
                }
            }
            catch (error) {
                
                console.log(error)
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
                return res.redirect('/')
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