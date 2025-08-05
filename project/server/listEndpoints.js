import express from 'express';
import listEndpoints from 'express-list-endpoints';
import app from '/index.js'; // <-- Adjust path to where your Express `app` is defined

console.log(listEndpoints(app));
