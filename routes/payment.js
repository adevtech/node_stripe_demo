var express = require('express');
/**
 * Stripe Initialization
 */ 

var stripe = require('stripe')('sk_test_5zjs1Gtx1gnaV7CqqhwHCOnV');
var router      = express.Router();

function createCharge(charge, productId) {

    return new Promise((resolve, reject) => {

        stripe.charges.create(charge, (err, res) => {

            if (err) return reject(err);
            //create transaction
            return resolve(res);
            
        });
    });
}

router.post('/:id/stripe', (req, res, next) => {

    const stripeToken = req.body.stripeToken;
    const productId = parseInt(req.body.productId);
    const productAmount = req.body.productAmount;
    const productName = req.body.productName;

    const charge = {

        amount: productAmount * 100,
        currency: 'usd',
        card: stripeToken
    };

    createCharge(charge, productId).then((res) => {
        console.log("result is ** ", res);
        req.status(200).send(`Thanks for purchasing a ${productName}`);
    }).catch((err) => {
        
        req.status(402).send('Error in making charge');
    }); 
});

/**
 * Retrieve the customer object for the currently logged in user
 */
router.get('/customer', (req, res, next) => {

    var customerId = req.body.customerId;

    stripe.customers.retrieve(customerId, (err, customer) => {
        if (err) {

            res.status(402).send('Error retrieving customer.');
        }else {
            res.json(customer);
        }
    });
});

/**
 * Attach a new payment source to the customer for the currently logged in user
 */

router.post('/customer/sources', (req, res, next) => {
    var customerId = req.body.customerId;

    stripe.customers.createSource(customerId, {
        source: req.body.source
    }, (err, source) => {
        if (err) {
            res.status(402).send('Error attaching source.');
        }else {
            res.status(200).end();
        }
    });
});

/**
 * Select a new default payment source on the customer for the currently logged in user
 */

router.post('/customer/default_source', (req, res) => {
    var customerId = req.body.customerId;
    stripe.customers.update(customerId, {
        default_source: req.body.defaultSource
    }, (err, customer) => {
        if(err) {
            res.status(402).send('Error setting default source');
        }else {
            res.status(200).end();
        }
    })
});

