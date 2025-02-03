const app = require('./app');
//const sequelize = require('./utils/database');

const PORT = process.env.PORT || 8000;

// sequelize
//     .sync()
//     //below sync are development use only
//     // .sync({alter:true})
//     // .sync({force:true})
//     .then(() => {
//        console.log('Database synchronized successfully'); //eslint-disable-line
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);// eslint-disable-line
});
// })
// .catch(err => {
//     console.error('Database synchronization failed:', err); // eslint-disable-line
//     process.exit(1); // Exit the application with a non-zero exit code
// });
