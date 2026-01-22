"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        "InterviewSessions",
        "feedback_en",
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "InterviewSessions",
        "feedback_id",
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn("InterviewSessions", "feedback_en", {
        transaction,
      });
      await queryInterface.removeColumn("InterviewSessions", "feedback_id", {
        transaction,
      });
    });
  },
};
