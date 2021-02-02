'use strict';

import config        from './../../etc/config';
import landingConfig from './../../etc/landingConfig';
import strformat     from 'strformat';

const userStaticUrl = config.userStaticUrl;
const systemStaticUrl = config.systemStaticUrl;
const quizWallActivationPath = config.urlPatterns.quizWallActivation;

const STANDARD_USER_AVATAR_FILENAME = 'profile.jpg';
const STANDARD_ORGANIZATION_AVATAR_FILENAME = 'companyProfile.png';

function dumpAccount(account) {
    const accountData = {
        id               : account.id,
        email            : account.email,
        avatarUrl        : _getAccountAvatarUrl(account.avatar, STANDARD_USER_AVATAR_FILENAME),
        smallAvatarUrl   : _getAccountAvatarUrl(account.smallAvatar, STANDARD_USER_AVATAR_FILENAME),
        backgroundURL    : _isCustomImage(account.backgroundURL)
                            ? `${userStaticUrl}/images/backgrounds/${account.backgroundURL}`
                            : `${systemStaticUrl}/images/backgrounds/${account.backgroundURL}`,
        isTrusted        : account.isTrusted,
        isPremium        : account.isPremium,
        status           : account.status,
        country          : account.country,
        city             : account.city,
        address          : account.address,
        phone            : account.phone,
        industry         : account.industry,
        site             : account.site,
        socialNetworks   : account.socialNetworks,
        type             : account.type,
        account          : account.account,
        summary          : account.summary,
        settings         : account.settings,
        lastLoginTime    : account.lastLoginTime,
        lastActivityTime : account.lastActivityTime,
        createdAt        : account.createdAt,
        statusMessage    : account.statusMessage
    };

    if ( account.type === 'USER' ) {
        accountData.firstName      = account.firstName;
        accountData.secondName     = account.secondName;
        accountData.sex            = account.sex;
        accountData.dateOfBirth    = account.dateOfBirth;
        accountData.courses        = account.courses;
        accountData.education      = account.education;
        accountData.experience     = account.experience;
        accountData.languages      = account.languages;
    } else {
        accountData.companyName    = account.companyName;
        accountData.numberOfPeople = account.numberOfPeople;
    }

    return accountData;
}

function _getAccountAvatarUrl(avatar, standardAvatar) {
    if (avatar.includes('http')) {
        return avatar;
    }

    return `${avatar === standardAvatar ? systemStaticUrl : userStaticUrl}/avatars/${avatar}`;
}

function dumpTag(tag) {
    return {
        value: tag.id,
        label: tag.name
    };
}

function dumpOrganizationPermissions(permissions) {
    // TODO do not use targetEntities
    const targetEntities = [
        'questions',
        'quizzes',
        'activations',
        'networkGroups'
    ];

    return Object.keys(permissions).reduce((formattedObject, entity) => {
        if (!targetEntities.includes(entity)) {
            return formattedObject;
        }

        formattedObject[entity] = {
            canEdit        : permissions[entity].own      === 'RW',
            canUseShared : permissions[entity].shared === 'RW'
        };

        return formattedObject;
    }, {});
}

function dumpNetworkGroup(group, totalMembers) {
    return {
        id: group.id,
        name: group.name,
        description: group.description,
        isShared: group.isShared,
        totalMembers,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
    };
}

function dumpPendingMember(pendingMember) {
    return {
        email: pendingMember.email,
        avatarUrl : ((pendingMember.avatar).indexOf('http') >= 0 )
            ? pendingMember.avatar
            : `${systemStaticUrl}/avatars/${pendingMember.avatar}`
    };
}

function dumpNetworkMember({member, groups}) {
    return {
        id: member.id,
        name: `${member.firstName} ${member.secondName}`.trim(),
        email: member.email,
        links: {
            groups: groups.filter(group => group.name).map(group => ({id: group.id, name: group.name}))
        },
        avatarUrl: ((member.avatar).indexOf('http') >= 0 )
            ? member.avatar
            : `${userStaticUrl}/avatars/${member.avatar}`
    };
}

function dumpMembers(member) {
    let resultAvatar;
    if ( member.smallAvatar === 'profile.jpg' && member.avatar !== 'profile.jpg' ) {
        resultAvatar = member.avatar;
    } else {
        resultAvatar = member.smallAvatar;
    }
    return {
        id: member.id,
        firstName: member.firstName,
        secondName: member.secondName,
        email: member.email,
        avatarUrl : ((resultAvatar).indexOf('http') >= 0 )
            ? resultAvatar
            : `${userStaticUrl}/avatars/${resultAvatar}`
    };
}

function dumpOrganization({organization, withBigAvatar}) {
    return {
        id          : organization.id,
        name        : organization.companyName,
        description : organization.summary,
        plan        : organization.account.type,
        createdAt   : organization.createdAt,
        updatedAt   : organization.updatedAt || organization.createdAt,
        avatarUrl   : _getAccountAvatarUrl(
            withBigAvatar ? organization.avatar : organization.smallAvatar,
            STANDARD_ORGANIZATION_AVATAR_FILENAME
        )
    };
}

function dumpGroup({group}) {
    return {
        id  : group.id,
        type: group.type,
        name: group.name,
        description: group.description,
        permissions: group.permissions,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        membersTotal: group.members.length
    };
}

function dumpQuestion(question) {
    const questionData = {
        id                : question.id,
        body              : question.body,
        type              : question.type,
        points            : question.points,
        options           : question.options,
        createdAt         : question.createdAt,
        updatedAt         : question.updatedAt,
        statistics        : question.statistics,
        isMarkdownEnabled : question.isMarkdownEnabled,
        isSurvey          : question.isSurvey,
        formula           : question.formula,
        tags              : question.tags,
        quizzes           : question.quizzes,
        explanation       : question.explanation,
        isShared          : question.isShared
    };

    return questionData;
}

function dumpQuiz(quiz) {
    const quizData = {
        id:                  quiz.id,
        description:         quiz.description,
        name:                quiz.name,
        pictureURL:          _isCustomImage(quiz.pictureURL)
                             ? `${userStaticUrl}/images/quizImages/${quiz.pictureURL}`
                             : `${systemStaticUrl}/images/quizImages/${quiz.pictureURL}`,
        questions:           quiz.questions,
        createdAt:           quiz.createdAt,
        updatedAt:           quiz.updatedAt,
        numberOfActivations: quiz.numberOfActivations,
        statistics:          quiz.statistics
    };

    return quizData;
}

function dumpActivation(activation) {
    const publicLink = makeActivationPublicLink(activation);

    const activationData = {
        publicLink,
        id:                            activation.id,
        name:                          activation.name,
        message:                       activation.message,
        pictureURL:                    _isCustomImage(activation.pictureURL)
                                       ? `${userStaticUrl}/images/quizImages/${activation.pictureURL}`
                                       : `${systemStaticUrl}/images/quizImages/${activation.pictureURL}`,
        emails :                       activation.emails,
        isPublic :                     activation.isPublic,
        timeToPass:                    activation.timeToPass,
        dueTime:                       activation.dueTime,
        mixQuestions:                  activation.mixQuestions,
        numberOfQuestions:             activation.numberOfQuestions,
        getNotification:               activation.getNotification,
        status:                        activation.status,
        activatedAt:                   activation.activatedAt,
        finishedAt:                    activation.finishedAt,
        tags:                          activation.tags,
        canAssigneeViewQuestions:      activation.canAssigneeViewQuestions,
        numberOfSessionsPerAccount:    activation.numberOfSessionsPerAccount,
        category:                      activation.category,
        isRepublication:               activation.isRepublication,
        canRepublish:                  activation.canRepublish,
        canContact:                    activation.canContact,
        assessmentSystemId:            activation.assessmentSystemId,
        assessmentSystemType:          activation.assessmentSystemType,
        statistics: {
            peopleGainedLowResults:      activation.statistics.peopleGainedLowResults,
            peopleGainedModerateResults: activation.statistics.peopleGainedModerateResults,
            peopleGainedHighResults:     activation.statistics.peopleGainedHighResults,
            numberOfQuizSessions:        activation.statistics.numberOfQuizSessions
        },

        links: {
            owner: {
                type: 'accounts',
                id: activation.accountId
            },
            quiz: {
                type: 'quizzes',
                id: activation.quizId
            },
            action: {
                type: 'actions',
                id: activation.actionId
            }
        },
        passingsLeft: activation.passingsLeft
    };

    if ( activation.isRepublication ) {
        activationData.links.originalOwner = {
            type: 'accounts',
            id: activation.originalOwnerId
        };
    }

    return activationData;
}

function dumpQuizSession(quizSession) {
    const assigneeShareLink = strformat( config.urlPatterns.resultShareLink, {
        quizWallUrl: config.quizWallUrl,
        activationId: quizSession.activationId,
        assigneeId: quizSession.assigneeId
    });

    const numberOfAnsweredQuestions = getNumberOfAnsweredQuestion(quizSession.answers);

    const quizSessionData = {
        assigneeShareLink,
        numberOfAnsweredQuestions,
        id:                       quizSession.id,
        status:                   quizSession.status,
        startedAt:                quizSession.startedAt,
        finishedAt:               quizSession.finishedAt,
        maxPoints:                quizSession.maxPoints,
        questions:                quizSession.questions,
        timeToPass:               quizSession.timeToPass,
        createdAt:                quizSession.createdAt,
        isPublished:              quizSession.isPublished,
        canAssigneeViewQuestions: quizSession.canAssigneeViewQuestions,
        category:                 quizSession.category,
        numberOfPassing:          quizSession.numberOfPassing,
        events:                   {
            quizSessionStartedAt: quizSession.startedAt,
            quizSessionFinishedAt: quizSession.finishedAt,
            entities: quizSession.events
        },

        links: {
            activation: {
                type: 'activations',
                id: quizSession.activationId
            },
            owner: {
                type: 'accounts',
                id: quizSession.accountId
            },
            assignee: {
                type: 'accounts',
                id: quizSession.assigneeId
            }
        }
    };

    if ( quizSession.status === 'FINISHED') {
        quizSessionData.gainedPoints = quizSession.gainedPoints;
    }

    return quizSessionData;
}

function dumpCourseRequest(courseRequest) {
    const courseRequestData = {
        id:                  courseRequest.id,
        applicantFirstName:  courseRequest.applicantFirstName,
        applicantSecondName: courseRequest.applicantSecondName,
        courseType:          courseRequest.courseType,
        city:                courseRequest.city,
        phone:               courseRequest.phone,
        score:               courseRequest.score,
        getNotification:     courseRequest.getNotification,
        createdAt:           courseRequest.createdAt,

        links: {
            activation: {
                type: 'activations',
                id: courseRequest.activationId
            },
            owner: {
                type: 'accounts',
                id: courseRequest.accountId
            },
            applicant: {
                type: 'accounts',
                id: courseRequest.applicantId
            }
        }
    };

    if ( courseRequest.quizSessionId ) {
        courseRequestData.links.quizSession = {
            type: 'quizSession',
            id: courseRequest.quizSessionId
        };
    }

    return courseRequestData;
}

function dumpMetaData(metadata) {
    const dumpedMetaData = {
        id:        metadata.id,
        createdAt: metadata.createdAt,
        accountId:    metadata.accountId,
        type:      metadata.type,
        title:     metadata.title,
        text:      metadata.text,
        rating:    metadata.rating
    };

    return dumpedMetaData;
}

function dumpAssigneeReport(assigneeReport) {
    const dumpedAssigneeReport = assigneeReport;

    dumpedAssigneeReport.pictureURL = _isCustomImage(assigneeReport.pictureURL)
        ? `${userStaticUrl}/images/quizImages/${assigneeReport.pictureURL}`
        : `${systemStaticUrl}/images/quizImages/${assigneeReport.pictureURL}`;
    dumpedAssigneeReport.publicLink = makeActivationPublicLink(assigneeReport);

    return dumpedAssigneeReport;
}

function dumpAssessmentSystem(system) {
    const dumpedAssessmentSystem = {
        id:               system.id,
        name:             system.name,
        assessmentSystem: system.assessmentSystem
    };

    return dumpedAssessmentSystem;
}

function prepareTags(tags) {
    return tags.map( tag => {
        return tag.replace(/<\/?[^>]+>/g, ' ')
            .replace(/[^A-Za-zА-Яа-яЁёЇїІіҐґЄєÄäÖöÜüß0-9+\-_#\.]|\s/g, ' ')
            .replace(/\s{2,}/g, " ")
            .toLowerCase();
    });
}

function makeActivationPublicLink(activation) {
    return strformat(quizWallActivationPath, {
        slug        : _makeSlug(activation.name),
        UIRootUrl   : config.UIRootUrl,
        quizWallUrl : config.quizWallUrl,
        activationId: activation.id
    });
}

function getNumberOfAnsweredQuestion(answers) {
    let numberOfAnsweredQuestions = 0;

    answers.forEach(answer => {
        if (answer.answer.length) {
            numberOfAnsweredQuestions++;
        }
    });

    return numberOfAnsweredQuestions;
}

function _makeSlug(name = '') {
    const cleanName = name.replace(/[\-\s]+/g, '-')
               .replace(/[^0-9a-zа-яїі\-]/gi, '')
               .toLowerCase();

    return encodeURIComponent(cleanName);
}

function getUniqueArray(array) {
    return Object.keys(array.reduce((uniqueItems, currentItem) => {
        if (!uniqueItems[currentItem]) {
            uniqueItems[currentItem] = true;
        }

        return uniqueItems;
    }, {}));
}

async function getIsMemberCanUpdateNetworkGroup(member, group, accountId, allowedTypes = []) {
    const permissions = await member.getOrganizationPermissions(accountId);

    if (group.isShared) {
        return allowedTypes.indexOf('shared') !== -1;
    }

    if (group.ownerId.toString() === member.id) {
        return  permissions.networkGroups.own === 'RW';
    }

    return permissions.networkGroups.others === 'RW';
}

function isPayedOrganization(organizationId) {
    return landingConfig.organizationId === organizationId;
}

function _isCustomImage(imageName = '') {
    return Boolean(imageName.match(/[A-Za-z0-9]{32}/));
}

module.exports = {
    dumpAccount,
    dumpOrganization,
    dumpQuestion,
    dumpQuiz,
    dumpActivation,
    dumpQuizSession,
    dumpCourseRequest,
    dumpMetaData,
    dumpAssigneeReport,
    dumpAssessmentSystem,
    prepareTags,
    makeActivationPublicLink,
    getUniqueArray,
    dumpPendingMember,
    dumpMembers,
    dumpGroup,
    dumpNetworkMember,
    dumpNetworkGroup,
    getIsMemberCanUpdateNetworkGroup,
    dumpOrganizationPermissions,
    dumpTag,
    isPayedOrganization
};
