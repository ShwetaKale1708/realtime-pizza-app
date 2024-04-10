

function cartController(){
    
    return{
        index(req,res){
            res.render('customers/cart')
        },

        update(req,res){
            // let cart={
            //     items:{
            //         pizzaId:{item:pizzaObject,qty:0},
            //     },
            //     totalQty:0,
            //     totalPrice:0
            // }
            
            if(!req.session.cart){
                req.session.cart={
                    items:{},
                    totalQTY:0,
                    totalPrice:0
                }
                
            }
            
                let cart=req.session.cart
            // console.log(req.body)
            if(req.session.cart.totalQTY<10){
            if(!cart.items[req.body._id]){
                 cart.items[req.body._id]={
                    item:req.body,
                    qty:1
                 },
                 cart.totalQTY=cart.totalQTY+1 
                 cart.totalPrice=cart.totalPrice+req.body.price
                }else{
                    cart.items[req.body._id].qty= cart.items[req.body._id].qty+1
                    cart.totalQTY=cart.totalQTY+1 
                    cart.totalPrice=cart.totalPrice+req.body.price
                }
            res.json({totalQTY:req.session.cart.totalQTY})
            }
            
           
            
        
    }
    }
}

module.exports=cartController