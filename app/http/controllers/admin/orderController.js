const Order=require('../../../models/order')

function orderController(){
    return{
        index(req, res) {
            
            Order.find({ status: { $ne: 'completed' } }).sort({ createdAt: -1 }).populate('customerId', '-password')
            
                .then(orders => {
                    
                    debugger   
                    if (req.xhr) {
                        return res.json(orders);
                    } else {
                        debugger
                        res.render('admin/orders', { orders });
                    }
                })
                .catch(err => {
                    console.error('Error fetching orders:', err);
                    
                });
        }
        
    }
}

module.exports=orderController