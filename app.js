const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Contact = require('./model/contact');


const app = express();
const port = 3000;

// Setup method-override
app.use(methodOverride('_method'));

// Setup EJS
app.set('view engine', 'ejs');
app.use(expressLayouts); //Third party middleware
app.use(express.static('Public')); //Build-in middleware
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(
    session({
        cookie: { maxAge: 6000},
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

// Halaman Home
app.get('/', (req, res) => {
    const mahasiswa = [
    {
        nama: 'Muhammad Hansyah Utama',
        email: 'hansyahutama477@gmail.com',
    },
    {
        nama: 'Combro',
        email: 'combro@gmail.com',
    },
    {
        nama: 'Cacing',
        email: 'cacing@gmail.com',
    },
    ];
    res.render('index', { 
        nama: 'Muhammad Hansyah Utama', 
        title: 'Home',
        mahasiswa,
        layout: 'layouts/main-layout',
    });
});
    
// Halaman About
app.get('/about', (req, res, next) => {
    res.render('about', {
        layout: 'layouts/main-layout', 
        title: 'Halaman About',
    });
});

// Halaman Contact
app.get('/contact', async(req, res) => {
    const contacts = await Contact.find();

    res.render('contact', {
        layout: 'layouts/main-layout',
        title: 'Detail Contact',
        contacts,
        msg: req.flash('msg'),
    });
});

// halaman form tambah data contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form Data Contact',
        layout: 'layouts/main-layout',
    });
});

//proses tambah data contact
app.post('/contact', [
    body('nama').custom(async (value) => {
        const duplikat = await Contact.findOne({ nama: value });
        if(duplikat) {
            throw new Error('Nama contact sudah terdaftar!');
        }
        return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid!').isMobilePhone('id-ID')
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('add-contact', {
            title: 'Form Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
        });
    } else {
        Contact.insertMany(req.body, (error, result) => {
            // kirimkan flash message
            req.flash('msg', 'Data contact berhasil ditambahkan!');
            res.redirect('/contact');
        });
    }
});

// // proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
// const contact = await Contact.findOne({nama: 
//req.params.nama});
// if(!contact) {
// res.status(404);
// res.send('<h1>404</h1>');
// } else {
// Contact.deleteOne({nama: req.params.nama});
// req.flash('msg', 'Data contact berhasil dihapus!');
// res.redirect('/contact');
// }
// });

app.delete('/contact', (req, res) => {
    Contact.deleteOne({nama: req.body.nama}).then((result) => {
        req.flash('msg', 'Data contact berhasil dihapus!');
        res.redirect('/contact');
    });
});

// proses ubah data
app.put('/contact', [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({nama: value});
        if(value !== req.body.oldNama && duplikat) {
            throw new Error('Nama contact sudah terdaftar!');
        }
        return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid!').isMobilePhone('id-ID')
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('edit-contact', {
            title: 'Form Ubah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            contact: req.body,
        });

} else {
    Contact.updateOne(
        {_id: req.body._id},
        {
            $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
        },
    }
).then((result) => {
            // kirimkan flash message
            req.flash('msg', 'Data contact berhasil diubah!');
            res.redirect('/contact');
        });
    }
});

// halaman form ubah data contact
    app.get('/contact/edit/:nama', async (req, res) => {
        const contact = await Contact.findOne({ nama: req.params.nama 
});
    res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layout',
        contact,
    });
});

// halaman detail contact
app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama 
});
    res.render('details', {
        layout: 'layouts/main-layout',
        title: 'Halaman Contact',
        contact,
    });
});
    

app.listen(port, () => {
    console.log('Mongo Cantact App | listening at https://localhost:${port}');
});