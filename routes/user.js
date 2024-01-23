const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../config");
const { User } = require("../db/index");
const { Course } = require("../db/index");

// User Routes
router.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    await User.create({
        username: username,
        password: password
    });
    res.json({
        message: 'User created successfully'
    })
});

router.post("/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    const user = await User.find({
      username: username,
      password: password,
    });
  
    if (user) {
      const token = jwt.sign(
        {
          username: username,
        },
        JWT_SECRET
      );
      res.status(200).json({
        message: "User signed in successfully",
        token: token,
      });
    }
  });

  router.get('/courses', async (req, res) => {
    const courses = await Course.find({});
    res.status(200).json({
        courses: courses
    })
});

router.post('/courses/:courseId', userMiddleware, async (req, res) => {
    const courseId = req.params.courseId;
    const username = req.username;
    try {
        await User.updateOne({
            username: username
        }, {
            $push: {
                purchasedCourses: courseId
            }
        });
        res.json({
            message: 'Course purchased successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error adding course'
        });
    }
});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    const user = await User.findOne({
        username: req.username
    });
    
    const courses = await Course.find({
        _id: {
            $in: user.purchasedCourses
        }
    });
    res.json({
        courses: courses
    });

});

module.exports = router