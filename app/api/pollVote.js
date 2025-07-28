const { models } = require('../config/models');

class PollVoteController {
    
    // ثبت رای جدید
    async createVote(req, res) {
        try {
            const { userId, userType, pollQuestionId, pollOptionId } = req.body;
            
            // بررسی وجود فیلدهای اجباری
            if (!userId || !userType || !pollQuestionId || !pollOptionId) {
                return res.status(400).json({
                    success: false,
                    message: 'تمام فیلدهای اجباری باید پر شوند'
                });
            }
            
            // بررسی نوع کاربر
            if (!['student', 'teacher'].includes(userType)) {
                return res.status(400).json({
                    success: false,
                    message: 'نوع کاربر باید student یا teacher باشد'
                });
            }
            
            // بررسی وجود سوال
            const question = await models.PollQuestion.findByPk(pollQuestionId);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'سوال نظرسنجی یافت نشد'
                });
            }
            
            // بررسی وجود گزینه
            const option = await models.PollOption.findByPk(pollOptionId);
            if (!option) {
                return res.status(404).json({
                    success: false,
                    message: 'گزینه انتخابی یافت نشد'
                });
            }
            
            // بررسی اینکه گزینه متعلق به سوال مورد نظر باشد
            if (option.pollQuestionId !== pollQuestionId) {
                return res.status(400).json({
                    success: false,
                    message: 'گزینه انتخابی متعلق به این سوال نیست'
                });
            }
            
            // بررسی وجود کاربر
            const userModel = userType === 'student' ? models.Student : models.Teacher;
            const user = await userModel.findByPk(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'کاربر یافت نشد'
                });
            }
            
            // بررسی اینکه کاربر قبلاً به این سوال رای نداده باشد
            const existingVote = await models.PollVote.findOne({
                where: {
                    userId,
                    userType,
                    pollQuestionId
                }
            });
            
            if (existingVote) {
                return res.status(400).json({
                    success: false,
                    message: 'شما قبلاً به این سوال رای داده‌اید'
                });
            }
            
            // ثبت رای
            const vote = await models.PollVote.create({
                userId,
                userType,
                pollQuestionId,
                pollOptionId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.status(201).json({
                success: true,
                message: 'رای شما با موفقیت ثبت شد',
                data: vote
            });
            
        } catch (error) {
            console.error('خطا در ثبت رای:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ثبت رای',
                error: error.message
            });
        }
    }
    
    // دریافت تمام رای‌ها
    async getAllVotes(req, res) {
        try {
            const votes = await models.PollVote.findAndCountAll({
                include: [
                    { model: models.PollQuestion, attributes: ['question'] },
                    { model: models.PollOption, attributes: ['optionText'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            
            res.json({
                success: true,
                data: votes.rows,
                total: votes.count
            });
            
        } catch (error) {
            console.error('خطا در دریافت رای‌ها:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت رای‌ها',
                error: error.message
            });
        }
    }
    
    // دریافت رای بر اساس آیدی
    async getVoteById(req, res) {
        try {
            const { id } = req.params;
            
            const vote = await models.PollVote.findByPk(id, {
                include: [
                    { model: models.PollQuestion, attributes: ['question'] },
                    { model: models.PollOption, attributes: ['optionText'] }
                ]
            });
            
            if (!vote) {
                return res.status(404).json({
                    success: false,
                    message: 'رای یافت نشد'
                });
            }
            
            res.json({
                success: true,
                data: vote
            });
            
        } catch (error) {
            console.error('خطا در دریافت رای:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت رای',
                error: error.message
            });
        }
    }
    
    // دریافت رای‌های یک کاربر
    async getUserVotes(req, res) {
        try {
            const { userId, userType } = req.params;
            
            if (!['student', 'teacher'].includes(userType)) {
                return res.status(400).json({
                    success: false,
                    message: 'نوع کاربر باید student یا teacher باشد'
                });
            }
            
            const votes = await models.PollVote.findAndCountAll({
                where: { userId, userType },
                include: [
                    { model: models.PollQuestion, attributes: ['question'] },
                    { model: models.PollOption, attributes: ['optionText'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            
            res.json({
                success: true,
                data: votes.rows,
                total: votes.count
            });
            
        } catch (error) {
            console.error('خطا در دریافت رای‌های کاربر:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت رای‌های کاربر',
                error: error.message
            });
        }
    }
    
    // دریافت رای‌های یک سوال
    async getQuestionVotes(req, res) {
        try {
            const { pollQuestionId } = req.params;
            
            // بررسی وجود سوال
            const question = await models.PollQuestion.findByPk(pollQuestionId);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'سوال نظرسنجی یافت نشد'
                });
            }
            
            const votes = await models.PollVote.findAndCountAll({
                where: { pollQuestionId },
                include: [
                    { model: models.PollOption, attributes: ['optionText'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            
            res.json({
                success: true,
                data: votes.rows,
                total: votes.count
            });
            
        } catch (error) {
            console.error('خطا در دریافت رای‌های سوال:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت رای‌های سوال',
                error: error.message
            });
        }
    }
    
    // دریافت آمار رای‌ها برای یک سوال
    async getQuestionStats(req, res) {
        try {
            const { pollQuestionId } = req.params;
            
            // بررسی وجود سوال
            const question = await models.PollQuestion.findByPk(pollQuestionId, {
                include: [
                    { 
                        model: models.PollOption,
                        include: [
                            {
                                model: models.PollVote,
                                attributes: []
                            }
                        ]
                    }
                ]
            });
            
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'سوال نظرسنجی یافت نشد'
                });
            }
            
            if (!question.PollOptions || question.PollOptions.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'گزینه‌ای برای این سوال یافت نشد'
                });
            }
            
            // محاسبه آمار با روش بهتر
            const totalVotes = await models.PollVote.count({
                where: { pollQuestionId }
            });
            
            let stats = [];
            try {
                // محاسبه آمار برای هر گزینه به صورت جداگانه
                for (const option of question.PollOptions) {
                    if (option && option.id && option.optionText) {
                        const voteCount = await models.PollVote.count({
                            where: { 
                                pollQuestionId,
                                pollOptionId: option.id
                            }
                        });
                        
                        const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
                        
                        stats.push({
                            optionId: option.id,
                            optionText: option.optionText,
                            voteCount,
                            percentage: parseFloat(percentage)
                        });
                    }
                }
            } catch (error) {
                console.error('خطا در محاسبه آمار گزینه‌ها:', error);
                stats = [];
            }
            
            res.json({
                success: true,
                data: {
                    questionId: question.id,
                    question: question.question,
                    totalVotes,
                    options: stats
                }
            });
            
        } catch (error) {
            console.error('خطا در دریافت آمار سوال:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت آمار سوال',
                error: error.message
            });
        }
    }
    
    // حذف رای
    async deleteVote(req, res) {
        try {
            const { id } = req.params;
            
            const vote = await models.PollVote.findByPk(id);
            if (!vote) {
                return res.status(404).json({
                    success: false,
                    message: 'رای یافت نشد'
                });
            }
            
            await vote.destroy();
            
            res.json({
                success: true,
                message: 'رای با موفقیت حذف شد'
            });
            
        } catch (error) {
            console.error('خطا در حذف رای:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف رای',
                error: error.message
            });
        }
    }
    
    // بررسی رای کاربر برای یک سوال
    async checkUserVote(req, res) {
        try {
            const { userId, userType, pollQuestionId } = req.params;
            
            if (!['student', 'teacher'].includes(userType)) {
                return res.status(400).json({
                    success: false,
                    message: 'نوع کاربر باید student یا teacher باشد'
                });
            }
            
            const vote = await models.PollVote.findOne({
                where: { userId, userType, pollQuestionId },
                include: [
                    { model: models.PollOption, attributes: ['id', 'optionText'] }
                ]
            });
            
            res.json({
                success: true,
                data: vote,
                hasVoted: !!vote
            });
            
        } catch (error) {
            console.error('خطا در بررسی رای کاربر:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بررسی رای کاربر',
                error: error.message
            });
        }
    }
}

module.exports = new PollVoteController();