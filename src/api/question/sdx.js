[
  {
    $match: {
      _id: new ObjectId("63f88c8f1584847861f947b2"),
      $or: [
        {
          share: false,
        },
        {
          $expr: {
            $and: [
              {
                $eq: [true, "$share"],
              },
              {
                $eq: ["$_id", new ObjectId("63f88c8f1584847861f947b2")],
              },
            ],
          },
        },
      ],
    },
  },
  {
    $lookup: {
      from: "user",
      localField: "createdBy",
      foreignField: "_id",
      as: "createdBy",
    },
  },
  {
    $unwind: {
      path: "$createdBy",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      _id: 1,
      question: 1,
      createdAt: 1,
      updatedAt: 1,
      new: 1,
      createdBy: {
        _id: "$createdBy._id",
        name: "$createdBy.name",
        subject: "$createdBy.subject",
        profileImage: "$createdBy.profileImage",
        currentRole: "$createdBy.currentRole",
      },
      displayProfile: 1,
      allowConnectionRequest: 1,
      view: 1,
      response: 1,
      status: 1,
      reportAbuse: 1,
      share: 1,
      experience: 1,
      dropdown: 1,
      group: 1,
      room: 1,
      filter: 1,
      new: 1,
    },
  },
  {
    $addFields: {
      isGroup: {
        $cond: [
          {
            $eq: ["$group", "Everyone"],
          },
          true,
          false,
        ],
      },
    },
  },
  {
    $lookup: {
      from: "answer_room",
      let: {
        aid: "$_id",
        questionId: "$_id",
        createdBy: "$createdBy._id",
      },
      pipeline: [
        {
          $match: {
            participateIds: {
              $size: 3,
            },
            $expr: {
              $and: [
                {
                  $eq: [
                    "$participateIds",
                    [
                      new ObjectId("63eb2193d4dcf17286a37795"),
                      "$$questionId",
                      "$$createdBy",
                    ],
                  ],
                },
              ],
            },
          },
        },
      ],
      as: "answer_room",
    },
  },
  {
    $unwind: {
      path: "$answer_room",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "answer",
      localField: "_id",
      foreignField: "question",
      let: {
        x: "$isGroup",
        y: "$answer_room._id",
        z: "$createdBy._id",
      },
      pipeline: [
        {
          $group: {
            _id: "$question",
            data: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $match: {
            data: {
              $elemMatch: {
                createdBy: new ObjectId("63eb2193d4dcf17286a37795"),
              },
            },
          },
        },
        {
          $unwind: {
            path: "$data",
          },
        },
        {
          $match: {
            $or: [
              {
                $expr: {
                  $and: [
                    {
                      $eq: [false, "$$x"],
                    },
                    {
                      $eq: ["$$y", "$data.roomId"],
                    },
                    {
                      $ne: [new ObjectId("63eb2193d4dcf17286a37795"), "$$z"],
                    },
                  ],
                },
              },
              {
                $expr: {
                  $and: [
                    {
                      $eq: [true, "$$x"],
                    },
                    {
                      $ne: [new ObjectId("63eb2193d4dcf17286a37795"), "$$z"],
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          $match: {
            "data.seenBy": {
              $nin: [new ObjectId("63eb2193d4dcf17286a37795")],
            },
            $expr: {
              $eq: ["$$x", "$data.isGroup"],
            },
            "data.createdBy": {
              $nin: [new ObjectId("63eb2193d4dcf17286a37795")],
            },
          },
        },
      ],
      as: "totalPendingAnswers",
    },
  },
  {
    $addFields: {
      totalPendingAnswersCount: {
        $size: "$totalPendingAnswers",
      },
    },
  },
  {
    $lookup: {
      from: "verificationStatus",
      let: {
        aid: "$_id",
        questionId: "$_id",
        createdBy: "$createdBy._id",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$userId", "$$createdBy"],
                },
              ],
            },
          },
        },
      ],
      as: "verificationStatus",
    },
  },
  {
    $unwind: {
      path: "$verificationStatus",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      accept: "$verificationStatus.accept",
    },
  },
  {
    $group: {
      _id: "$_id",
      displayProfile: {
        $first: "$displayProfile",
      },
      allowConnectionRequest: {
        $first: "$allowConnectionRequest",
      },
      view: {
        $first: "$view",
      },
      response: {
        $first: "$response",
      },
      status: {
        $first: "$status",
      },
      reportAbuse: {
        $first: "$reportAbuse",
      },
      share: {
        $first: "$share",
      },
      experience: {
        $first: "$experience",
      },
      dropdown: {
        $first: "$dropdown",
      },
      group: {
        $first: "$group",
      },
      room: {
        $first: "$room",
      },
      new: {
        $first: "$new",
      },
      question: {
        $first: "$question",
      },
      filter: {
        $first: "$filter",
      },
      createdAt: {
        $first: "$createdAt",
      },
      isGroup: {
        $first: "$isGroup",
      },
      createdBy: {
        $first: "$createdBy",
      },
      totalPendingAnswers: {
        $first: "$totalPendingAnswers",
      },
      totalPendingAnswersCount: {
        $first: "$totalPendingAnswersCount",
      },
      verificationStatus: {
        $first: "$verificationStatus",
      },
      accept: {
        $first: "$accept",
      },
      findAnswer1: {
        $first: "$findAnswer1",
      },
      findAnswer2: {
        $first: "$findAnswer2",
      },
      answer_room1: {
        $addToSet: "$answer_room1",
      },
      answer_group: {
        $first: "$answer_group",
      },
      participateGroupId: {
        $first: "$participateGroupId",
      },
      answer_group1: {
        $first: "$answer_group1",
      },
      answer_group_respondent: {
        $first: "$answer_group_respondent",
      },
    },
  },
  {
    $addFields: {
      optionNames: "$filter.options.optionName",
    },
  },
  {
    $unwind: {
      path: "$optionNames",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $unwind: {
      path: "$optionNames",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: "$_id",
      displayProfile: {
        $first: "$displayProfile",
      },
      allowConnectionRequest: {
        $first: "$allowConnectionRequest",
      },
      view: {
        $first: "$view",
      },
      response: {
        $first: "$response",
      },
      status: {
        $first: "$status",
      },
      reportAbuse: {
        $first: "$reportAbuse",
      },
      share: {
        $first: "$share",
      },
      experience: {
        $first: "$experience",
      },
      dropdown: {
        $first: "$dropdown",
      },
      group: {
        $first: "$group",
      },
      room: {
        $first: "$room",
      },
      new: {
        $first: "$new",
      },
      question: {
        $first: "$question",
      },
      filter: {
        $first: "$filter",
      },
      createdAt: {
        $first: "$createdAt",
      },
      isGroup: {
        $first: "$isGroup",
      },
      createdBy: {
        $first: "$createdBy",
      },
      totalPendingAnswers: {
        $first: "$totalPendingAnswers",
      },
      totalPendingAnswersCount: {
        $first: "$totalPendingAnswersCount",
      },
      verificationStatus: {
        $first: "$verificationStatus",
      },
      accept: {
        $first: "$accept",
      },
      findAnswer1: {
        $first: "$findAnswer1",
      },
      findAnswer2: {
        $first: "$findAnswer2",
      },
      answer_room1: {
        $addToSet: "$answer_room1",
      },
      answer_group: {
        $first: "$answer_group",
      },
      participateGroupId: {
        $first: "$participateGroupId",
      },
      answer_group1: {
        $first: "$answer_group1",
      },
      answer_group_respondent: {
        $first: "$answer_group_respondent",
      },
      optionNames: {
        $addToSet: "$optionNames",
      },
    },
  },
  {
    $addFields: {
      optionNamesSize: {
        $size: "$optionNames",
      },
    },
  },
  {
    $lookup: {
      from: "user",
      let: {
        aid: "$_id",
        questionId: "$_id",
        createdBy: "$createdBy._id",
        share: "$share",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [true, "$$share"],
                },
                {
                  $ne: ["$isOrganization", true],
                },
                {
                  $in: ["$shareQuestion", ["$$aid"]],
                },
              ],
            },
          },
        },
      ],
      as: "sharereach1",
    },
  },
  {
    $lookup: {
      from: "user",
      let: {
        aid: "$_id",
        questionId: "$_id",
        createdBy: "$createdBy._id",
        share: "$share",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [false, "$$share"],
                },
                {
                  $ne: ["$isOrganization", true],
                },
              ],
            },
          },
        },
      ],
      as: "sharereach2",
    },
  },
  {
    $lookup: {
      from: "user",
      let: {
        aid: "$_id",
        questionId: "$_id",
        createdBy: "$createdBy._id",
        share: "$share",
        optionNamesSize: "$optionNamesSize",
        optionNames: "$optionNames",
        name: "$question",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                {
                  $cond: {
                    if: {
                      $eq: [
                        {
                          $type: "$name",
                        },
                        "array",
                      ],
                    },
                    then: {
                      $gt: [
                        {
                          $size: {
                            $setIntersection: ["$subject", "$$optionNames"],
                          },
                        },
                        0,
                      ],
                    },
                    else: {
                      $in: ["$name", "$$optionNames"],
                    },
                  },
                },
              ],
            },
          },
        },
      ],
      as: "sharereach3",
    },
  },
  {
    $addFields: {
      reach: {
        $cond: {
          if: {
            $and: [
              {
                $gte: ["$optionNamesSize", 0],
              },
              {
                $eq: ["$share", true],
              },
            ],
          },
          then: {
            $size: "$sharereach1",
          },
          else: {
            $cond: {
              if: {
                $and: [
                  {
                    $gte: ["$optionNamesSize", 0],
                  },
                  {
                    $eq: ["$share", false],
                  },
                ],
              },
              then: {
                $size: "$sharereach3",
              },
              else: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $lte: ["$optionNamesSize", 0],
                      },
                      {
                        $eq: ["$share", true],
                      },
                    ],
                  },
                  then: {
                    $size: "$sharereach1",
                  },
                  else: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $lte: ["$optionNamesSize", 0],
                          },
                          {
                            $eq: ["$share", false],
                          },
                        ],
                      },
                      then: {
                        $size: "$sharereach2",
                      },
                      else: 0,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    $sort: {
      totalPendingAnswersCount: -1,
      new: 1,
      createdAt: -1,
    },
  },
];
