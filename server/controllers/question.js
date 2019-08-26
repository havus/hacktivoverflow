const Question = require('../models/question');

class QuestionController {
  static create(req, res, next) {
    const { title, text } = req.body;
    Question.create({ user_id: req.payload._id, title, text })
      .then(() => {
        res.status(201).json({
          message: 'Created!'
        })
      })
      .catch( next );
  }

  static findAll(req, res, next) {
    Question.find()
      .populate('user_id', 'fullname')
      .populate('comments')
      .populate({
        path : 'answers',
        populate: {
          path: 'comments'
        }
      })
      .then( data => {
        res.status(200).json(data);
      })
      .catch( next );
  }

  static findOne(req, res, next) {
    Question.findOne({ _id: req.params.id })
      .populate('comments')
      .populate({
        path : 'answers',
        populate: {
          path: 'comments'
        }
      })
      .then( data => {
        res.status(200).json(data);
      })
      .catch( next );
  }

  static deleteQuestion(req, res, next) {
    Question.deleteOne({ _id: req.params.id })
      .then(() => {
        res.status(200).json({ message: 'Question deleted!' })
      })
      .catch( next );
  }

  static upvote(req, res, next) {
    Question.findOne({ _id: req.params.id })
      .then(one => {
        if (one) {
          if (one.user_id == req.payload._id) {
            return 'VOTE_SELF';
          } else {  
            return Question.updateOne(
              { _id: req.params.id },
              { $pull: { down_votes: req.payload._id } }
            )
          }
        } else {
          return 'QUESTION_NOT_FOUND';
        }
      })
      .then(message => {
        if (message === 'QUESTION_NOT_FOUND' || message === 'VOTE_SELF') {
          return message;
        } else {
          return Question.updateOne(
            { _id: req.params.id },
            { $addToSet: { up_votes: req.payload._id } }
          )
        }
      })
      .then(message => {
        if (message === 'QUESTION_NOT_FOUND'|| message === 'VOTE_SELF') {
          next({ message })
        } else {
          res.status(200).json({ message: 'Voted up!' })
        }
      })
      .catch( next )
  }
  
  static downvote(req, res, next) {
    Question.findOne({ _id: req.params.id })
      .then(one => {
        if (one) {
          if (one.user_id == req.payload._id) {
            return 'VOTE_SELF';
          } else {  
            return Question.updateOne(
              { _id: req.params.id },
              { $pull: { up_votes: req.payload._id } }
            )
          }
        } else {
          return 'QUESTION_NOT_FOUND';
        }
      })
      .then(message => {
        if (message === 'QUESTION_NOT_FOUND' || message === 'VOTE_SELF') {
          return message;
        } else {
          return Question.updateOne(
            { _id: req.params.id },
            { $addToSet: { down_votes: req.payload._id } }
          )
        }
      })
      .then(message => {
        if (message === 'QUESTION_NOT_FOUND'|| message === 'VOTE_SELF') {
          next({ message })
        } else {
          res.status(200).json({ message: 'Voted down!' })
        }
      })
      .catch( next )
  }

  static addTags(req, res, next) {
    let tags = null;
    if (typeof req.body.tags === 'String') {
      tags = [ req.body.tags ];
    } else {
      tags = [...req.body.tags];
    }

    Question.updateOne(
      { _id: req.params.id },
      { $addToSet: { tags: {$each: [...tags]} } },
    )
      .then(() => {
        res.status(200).json({ message: 'Tags added!' });
      })
      .catch( next );
  }

  static getTags(req, res, next) {
    Question.find()
      .then(data => {
        let filter = data.filter(el => el.tags.includes(req.params.tag))
        res.status(200).json({ filter });
      })
      .catch( next );
  }
}

module.exports = QuestionController;