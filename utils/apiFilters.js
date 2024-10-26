class APIFilters{
    constructor(query,queryStr){
        this.query = query
        this.queryStr = queryStr
    }

    filter(){
        const queryCopy = {...this.queryStr};

        //Removing fields from query
        const removeFields = ['sort','fields']
        removeFields.forEach(el => delete queryCopy[el])

        //advane query filter using: lt,lte,gt,gte

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

        console.log(queryStr)
        this.query = this.query.find(JSON.parse(queryStr))
        return this;
    }


    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.split(',').join('');
            this.query = this.query.sort(sortBy);
        }else{
            this.query = this.query.sort('-postingDate');
        }

        return this
    }

    limitFields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.sort('-__v');
        }

        return this;
    }
}
module.exports = APIFilters