var apiUrl = `/api/v1`;
var fn_recommend_config = {
	bookshelf_pid: "125", //书架
	gril_category_genre: "13", //女生大类
	bookcity: [{
		banner_pid: "126", //书城-男生-banner
		hotread_pid: "127", //书城-男生-本周热读
		recommendation_pid: "128", //书城-男生-主编推荐
		recommend_focus_pid: "129", //书城-男生-焦点推荐
		potential_new_book_pid: "130", //书城-男生-潜力新书
		complete_selection_pid: "131", //书城-男生-完本精选
		classi_fication_push: {
			pid: "132",
			category: [{
					name: '玄幻',
					id: '1'
				},
				{
					name: '都市',
					id: '5'
				},
				{
					name: '仙侠',
					id: '4'
				},
				{
					name: '科幻',
					id: '10'
				},
				{
					name: '悬疑',
					id: '11'
				},
				{
					name: '奇幻',
					id: '2'
				},
				{
					name: '体育',
					id: '9'
				}
			],
		}, //书城-男生-分类强推
		book_list_pid: "133", //书城-男生-书单
		book_list_two_pid: "134", //书城-男生-书单2
	}, {
		banner_pid: "135", //书城-女生-banner
		hotread_pid: "136", //书城-女生-本周热读
		recommendation_pid: "137", //书城-女生-主编推荐
		recommend_focus_pid: "138", //书城-女生-焦点推荐
		potential_new_book_pid: "139", //书城-女生-潜力新书
		complete_selection_pid: "140", //书城-女生-完本精选
		classi_fication_push: {
			pid: "141",
			category: [{
					name: '古言',
					id: '73'
				},
				{
					name: '现言',
					id: '74'
				},
				{
					name: '幻情',
					id: '75'
				},
				{
					name: '仙侠',
					id: '76'
				},
				{
					name: '青春',
					id: '77'
				},
				{
					name: '科幻',
					id: '79'
				}
			],
		}, //书城-女生-分类强推
		book_list_pid: "142", //书城-女生-书单
		book_list_two_pid: "143", //书城-女生-书单2
	}],
	search_hot_book_pid: 144, //搜索-热门作品
	finish: [{
		module: [{
			name: "最新完本",
			pid: "145"
		}, {
			name: "主编推选",
			pid: "146"
		}, {
			name: "最热完本",
			pid: "147"
		}, {
			name: "精选完本",
			pid: "148"
		}, {
			name: "经典完本",
			pid: "149"
		}]
	}, {
		module: [{
			name: "最新完本",
			pid: "150"
		}, {
			name: "主编推选",
			pid: "151"
		}, {
			name: "最热完本",
			pid: "152"
		}, {
			name: "精选完本",
			pid: "153"
		}, {
			name: "经典完本",
			pid: "154"
		}]
	}],
	god: [{
		pid: ['155', '156']
	}, {
		pid: ['157', '158']
	}],
	ipzone: [{
		module: [{
			name: "优质IP",
			pid: "159"
		}, {
			name: "最新IP",
			pid: "160"
		}, {
			name: "出版专区",
			pid: "161"
		}, {
			name: "漫画专区",
			pid: "162"
		}, {
			name: "有声专区",
			pid: "163"
		}, {
			name: "影视专区",
			pid: "164"
		}]
	}, {
		module: [{
			name: "优质IP",
			pid: "165"
		}, {
			name: "最新IP",
			pid: "166"
		}, {
			name: "出版专区",
			pid: "167"
		}, {
			name: "漫画专区",
			pid: "168"
		}, {
			name: "有声专区",
			pid: "169"
		}, {
			name: "影视专区",
			pid: "170"
		}]
	}],
}