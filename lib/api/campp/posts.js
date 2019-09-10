'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @Author: Tai Dong <dongtaiit@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @Date:   2019-09-09 22:47:14
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @Last Modified by:   Tai Dong
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @Last Modified time: 2019-09-09 23:06:44
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var self = void 0;

var Post = function () {
  function Post(config) {
    _classCallCheck(this, Post);

    this.routeRegex = {
      PostsIndex: /^\/(@[\w\.\d-]+)\/feed\/?$/,
      UserProfile1: /^\/(@[\w\.\d-]+)\/?$/,
      UserProfile2: /^\/(@[\w\.\d-]+)\/(blog|posts|comments|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
      UserProfile3: /^\/(@[\w\.\d-]+)\/[\w\.\d-]+/,
      CategoryFilters: /^\/(hot|trending|promoted|payout|payout_comments|created)\/?$/gi,
      PostNoCategory: /^\/(@[\w\.\d-]+)\/([\w\d-]+)/,
      Post: /^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?($|\?)/,
      PostJson: /^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)(\.json)$/,
      UserJson: /^\/(@[\w\.\d-]+)(\.json)$/,
      UserNameJson: /^.*(?=(\.json))/
    };
    this.config = config;
    self = this;
  }

  _createClass(Post, [{
    key: '_buildData',
    value: function _buildData(path, posts) {
      posts = posts || [];
      var orignalPath = path.split('/')[0];
      var now = new Date();
      var result = {
        "feed_price": {
          "base": "0.210 USD",
          "quote": "1.000 MCASH"
        },
        "props": {
          "time": now,
          "sbd_print_rate": 0,
          "sbd_interest_rate": 0,
          "head_block_number": 36253942,
          "total_vesting_shares": "396853140515.514648 VESTS",
          "total_vesting_fund_steem": "200344821.392 STEEM",
          "last_irreversible_block_num": 36253924
        },
        "tags": {},
        "accounts": {},
        "content": {},
        "tag_idx": {},
        "discussion_idx": {
          "": {
            "trending": []
          }
        }
      };

      var discussionIdx = result.discussion_idx[""].trending;
      result.tag_idx[orignalPath] = result.tag_idx[orignalPath] || [];
      var tags = result.tag_idx[orignalPath] || [];
      var tagsTemp = {};

      posts.map(function (post) {
        post.tags.map(function (tag) {
          if (!tagsTemp[tag]) {
            tagsTemp[tag] = 1;
            tags.push(tag);
          }
        });

        discussionIdx.push(post.user.username + '/' + post.postId);

        var body = post.content || post.shortDesc;
        result.content[post.user.username + '/' + post.postId] = {
          "post_id": post.postId,
          "author": post.user.username,
          "permlink": post.postId,
          "category": tags[0] || 'unknown category',
          "title": post.title,
          "body": body,
          "json_metadata": JSON.stringify({
            "image": [post.thumbnail]
          }),
          "created": new Date(post.createdAt),
          "last_update": new Date(post.updatedAt),
          "depth": 0,
          "children": post.count_comment,
          "net_rshares": 425554588016215,
          "last_payout": new Date(post.createdAt),
          "cashout_time": now,
          "total_payout_value": "0.000 USD",
          "curator_payout_value": "0.000 USD",
          "pending_payout_value": post.totalReward + " USD",
          "promoted": "0.000 USD",
          "replies": [],
          "body_length": body.length,
          "active_votes": [],
          "author_reputation": 21765957547111,
          "parent_author": "",
          "parent_permlink": post.user.username,
          "url": '/' + tags[0] + '/' + post.user.username + '/' + post.postId,
          "root_title": post.title,
          "beneficiaries": [],
          "max_accepted_payout": "1000000.000 USD",
          "percent_steem_dollars": 10000
        };
      });

      return result;
    }
  }, {
    key: 'getStateAsync',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'trending';
        var orignalPath, url, paths, posts;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                path = decodeURIComponent(path);

                orignalPath = path.split('/')[0];
                url = 'http://' + self.config.campp_api + '/posts';
                _context.t0 = orignalPath;
                _context.next = _context.t0 === 'created' ? 6 : _context.t0 === 'hot' ? 8 : _context.t0 === 'trending' ? 8 : 11;
                break;

              case 6:
                url += '?type=new';
                return _context.abrupt('break', 13);

              case 8:
                url += '?type=hot';
                if (orignalPath[1]) {
                  url += '&tag=' + orignalPath[1];
                }
                return _context.abrupt('break', 13);

              case 11:
                if (/\w+\/@\w+\/[\w, -]+/.test(path)) {
                  paths = path.split('/');

                  url += '?type=posts&id=' + paths[paths.length - 1];
                }

                return _context.abrupt('break', 13);

              case 13:
                _context.next = 15;
                return _axios2.default.get(url).then(function (res) {
                  return res.data.data;
                }).catch(function (ex) {
                  console.log('ex', ex);
                  return null;
                });

              case 15:
                posts = _context.sent;
                return _context.abrupt('return', self._buildData(path, posts));

              case 17:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getStateAsync() {
        return _ref.apply(this, arguments);
      }

      return getStateAsync;
    }()
  }, {
    key: 'getDiscussionsByTrendingAsync',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getDiscussionsByTrendingAsync() {
        return _ref2.apply(this, arguments);
      }

      return getDiscussionsByTrendingAsync;
    }()
  }]);

  return Post;
}();

exports = module.exports = Post;