// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars

//const model = require('../models/leaderboard.model');

module.exports = function (options = {}) {
  return async context => {

    ///totul de mai jos trebuie facut in contextul unei collection 
    ///>>> tradus in MongoShell= db.xps.aggregate([.....]);
    const { Model } = context.app.service('xp'); 

    if('aggregate' in context.params.query) {

      var pageSize = 25, currentPage = 1, noOfSkipedDocs = 0;
      if (context.params.query["pageSize"] != undefined && ! isNaN(context.params.query["pageSize"]))
      {
        pageSize = parseInt(context.params.query["pageSize"]);
        pageSize = pageSize <= 0 ? 25 : pageSize;  //default pageSize at 25
      }

      if (context.params.query["currentPage"] != undefined && ! isNaN(context.params.query["currentPage"]))
      {
        currentPage = parseInt(context.params.query["currentPage"]);
        currentPage = currentPage <= 0 ? 1 : currentPage; //default currentPage=1
      }
      
      //calculate how may docs to skip
      noOfSkipedDocs = (currentPage - 1) * pageSize;

      //get the results. The above variables are used as js params below
      const result = await Model.aggregate(
        [
          {
            $group: {
              _id: "$user_id", 
              totalPerUser: {
                $sum: "$amount"
              }
            }
          }, {
            $lookup: {
              from: 'achievements', 
              localField: '_id', 
              foreignField: 'user_id', 
              as: 'achievements'
            }
          }, {
            $sort: {
              'totalPerUser': -1
            }
          }, {
            $facet: {
              pagination: [
                {
                  $count: "total"
                }, {
                  $addFields: {
                    currentPage: currentPage,
                    pageSize: pageSize
                  }
                }
              ], 
              data: [
                {
                  $skip: noOfSkipedDocs
                }, {
                  $limit: pageSize
                }
              ]
            }
          }
        ]
        ,function(err, data){
          console.log(data);
       });
      context.result = result;
    }


    return context;
  };
};
