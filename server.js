const express = require('express'),
      server = express(),
	fs = require('fs'),
      orderData = require('./orders');
	  
server.set('port', process.env.PORT || 3000);

server.get('/',(request,response)=>{
 response.send('Welcome to our simple online order managing web app!');
});


//Add the /orders code here!
server.get('/orders',(request,response)=>{
 response.send(orderData);
});

// Queue to serialize order writes and prevent race conditions on concurrent POSTs
let orderWriteQueue = Promise.resolve();

//Add the /neworder code here!
server.post('/neworder', express.json(), (request, response) => {
  orderWriteQueue = orderWriteQueue.then(() => {
    orderData.orders.push(request.body);
    return new Promise((resolve, reject) => {
      fs.writeFile('orders.json', JSON.stringify(orderData), (err) => {
        if (err) {
          orderData.orders.pop();
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }).then(() => {
    response.status(201).send('Success');
    console.log('Success');
  }).catch((err) => {
    response.status(500).send('Error saving order');
    console.error(err);
  });
});


//Add the /update/:id code here!
server.put('/update/:id', express.text({type: '*/*'}), (request, response) => {
  orderWriteQueue = orderWriteQueue.then(() => {
    const orderToUpdate = orderData.orders.find(o => o.id == request.params.id);
    if (!orderToUpdate) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      return Promise.reject(err);
    }

    const previousState = orderToUpdate.state;
    orderToUpdate.state = request.body;

    return new Promise((resolve, reject) => {
      fs.writeFile('orders.json', JSON.stringify(orderData), (err) => {
        if (err) {
          orderToUpdate.state = previousState;
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }).then(() => {
    response.send('Success');
    console.log('Success');
  }).catch((err) => {
    if (err.statusCode === 404) {
      response.status(404).send('Order not found');
    } else {
      response.status(500).send('Error saving order');
      console.error(err);
    }
  });
});

//Add the /delete/:id code here!
server.delete('/delete/:id', (request,response)=>{
      var items = orderData.orders
      var newData = {"orders": []}
      items.forEach(function(o) {
        console.log(o)
          if (o.id == request.params.id){
            console.log('Deleting order!') 
          } else{
            newData.orders.push(o)
          }
       });
     
      fs.writeFileSync('orders.json', JSON.stringify(newData));
      response.send('Success');
      console.log('Success');
     });


server.listen(3000,()=>{
 console.log('Express server started at port 3000');
});