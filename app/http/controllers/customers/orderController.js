const Order=require('../../../models/order')
const moment=require('moment')
const { body, validationResult, check}=require('express-validator')

function orderController(){
    
    return {
        async store(req,res){
            const {phone,address}=req.body
            if(!phone || !address){
                req.flash('error','All fields are required')
                req.flash('phone',phone)
                req.flash('address',address)
                return res.redirect('/cart')
            } 
            await check('phone').isLength({min:10,max:10}).withMessage('mobile number should be of 10 digits').run(req)
            await check('address').isLength({ min: 8 }).withMessage('address should have atleast 8 characters').run(req)
            const errors = validationResult(req);
                if (!errors.isEmpty()) {
       
                    req.flash('error', errors.array()[0].msg);
                    req.flash('phone',phone)
                    req.flash('address',address)
                    return res.redirect('/cart');
    }
            const order=new Order({
                customerId: req.user._id,
                items:req.session.cart.items,
                phone,
                address
            })
            order.save().then(result=>{
                Order.populate(result,{path:'customerId'}).then(placedOrder=>{
                    req.flash('success','Order placed successfully')
                    delete req.session.cart
                    // emit event
                    const eventEmitter=req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', placedOrder)
                    return res.redirect('/customer/orders')
                })

               

            }).catch(err=>{
                req.flash('error','Something went wrong')
                return res.redirect('/cart')
            })
        }  ,

        async index(req,res){
            const orders =await Order.find({customerId:req.user._id},null,{sort:{'createdAt':-1}})
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
            res.render('customers/orders',{orders:orders,moment:moment})
            // console.log(orders)
        },
        
        async show(req,res){
            const order=await Order.findById(req.params.id)
            if(req.user._id.toString() === order.customerId.toString()){
                return res.render('customers/singleOrder',{order})
            }
                return res.redirect('/')
            
        }
    }
}

module.exports=orderController