function homeController(){
    // factory function=> returns object
    return{
        index(req,res){
            res.render('home')
        }
    }
}

module.exports=homeController