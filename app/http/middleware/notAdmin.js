function notAdmin(req,res,next){
    if(req.isAuthenticated() && req.user.role!=='admin'){
        return next()
    }
    return res.redirect('/admin/orders')
}

module.exports=notAdmin