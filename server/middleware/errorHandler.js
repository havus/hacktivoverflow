function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    let validation = [];
    for (const key in err.errors) {
      validation.push(err.errors[key].message);
    }
    res.status(400).json({
      code: 400,
      message: validation
    })
  } else if (err.message === 'Wrong username / password' || err.message === 'Question not found') {
    res.status(404).json({
      code: 404,
      message: err.message
    })
  } else if (err.message === `don't vote your self!`) {
    res.status(400).json({
      code: 400,
      message: err.message
    })
  } else {
    if (err.message === 'Unauthorize' || err.message === 'jwt must be provided' || err.message === 'jwt malformed' || err.message === 'invalid signature') {
      res.status(401).json({
        code: 401,
        message: err.message
      })
    } else {
      res.status(500).json({
        code: 500,
        message: 'internal server error',
      })
    }
  }
  console.log(err);
}

module.exports = errorHandler;