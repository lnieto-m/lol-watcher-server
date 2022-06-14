import ExpressSetup from './expressSetup';

// TODO: setup rito api here and pass it to express

const app = ExpressSetup();

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on ${process.env.PORT}`);
})