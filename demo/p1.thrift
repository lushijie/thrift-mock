struct MenuInfoRequest {
  1: required string bizCode;
  2:  i64 shopId;
  3:  i32 shopType;
}
struct MenuInfo {
  1: required bool success;
  2: optional string errMsg;
  3: required i32 code;
  4:  list<DishesTypeCO> dishesTypes;
  5:  map<string, list<DishesCO>> typeIdDishesPair;
}
/**
     * typeId 菜品品类id
     * typeName 菜品品类名称
     * code 码
     */
struct DishesTypeCO {
  1: optional string typeId;
  2: optional string typeName;
  3: optional string code;
}
/**
     * id 比如当前属性是做法：id就是做法id
     * name 比如当前属性是做法： name是做法的名称
     * price 价格相关
     * vipPrice ExtAttrType取规格NORM种类时，才有vip价格
     * priceWay 价格方式：0，不加价    1：比例加价，此时price为1-100整数，需要额外加的金额为菜品单价*price/100  2：固定价格
     * isDefault 是否默认 1:是 0:否
     * repertory 库存 「-1 无限库存」
     * quantity 数量
     * index 索引
     */
struct DishesExtDetailCO {
  1: optional string id;
  2: optional string name;
  3: optional string price;
  4: optional string vipPrice;
  5: optional i32 priceWay;
  6: optional i32 isDefault;
  7: optional i32 repertory;
  8: optional i32 quantity;
  9: optional i32 index;
}
/**
     * id 当前属性类别的分类id
     * hotelId 分类餐厅Id
     * categoryName 分类名称
     * sort 排序顺序,正整数,按数字从小到大排序
     * selectFlag 做法分类选择方式1-单选，2-多选
     * dishesExtDetails 菜品扩展属性具体信息
     */
struct DishesExtCO {
  1: optional string id;
  2: optional string restaurantId;
  3: optional string categoryName;
  4: optional i32 sort;
  5: optional i32 selectFlag;
  6: optional list<DishesExtDetailCO> dishesExtDetails;
}
/**
     * id 菜品id
     * defaultFood是否默认菜品 1：是  0： 不是
     * count 菜品数量
     * name 名称
     * isRepeatable 是否重复
     * chooseFoodId 可替换菜品id
     * price 价格
     * typeDishesExtPair 菜品扩展属性 1加料信息、2做法信息、3规格信息
     *      规格 price vipPrice 无 priceWay
     *   		做法  price priceWay
     *   		加料  price priceWay  repertory
     * code code码
     * quantity 数量
     * index 索引
     * remark 备注
     * necessary 是否必须
     * unit 菜品单位
     * vipPrice vip价格
     * priceDiff 对于简易套餐，用户选择替换菜后，总价为之前的价格加上priceDiff，priceDiff可能为负数
     */
struct ComboCO {
  1: optional string id;
  2: optional i32 defaultFood;
  3: optional i32 count;
  4: optional string name;
  5: optional i32 isRepeatable;
  6: optional string chooseFoodId;
  7: optional string price;
  8: optional map<i32, list<DishesExtCO>> typeDishesExtPair;
  9: optional string code;
  10: optional i32 index;
  11: optional string remark;
  12: optional i32 quantity;
  13: optional bool necessary;
  14: optional string unit;
  15: optional string vipPrice;
  16: optional string priceDiff;
}
/**
     * id 套餐id
     * groupName 套餐组的名字
     * isRepeatable 是否重复选
     * count 菜品数量
     * price 价格
     * name 套餐名称
     * comboList 套餐中的菜品
     * typeDishesExtPair 菜品扩展属性 1加料信息、2做法信息、3规格信息
     * index 索引
     * quantity 数量
     */
struct DishesComboCO {
  1: optional string id;
  2: optional string groupName;
  3: optional i32 isRepeatable;
  4: optional i32 count;
  5: optional string price;
  6: optional string name;
  7: optional list<ComboCO> comboList;
  8: optional map<i32, list<DishesExtCO>> typeDishesExtPair;
  9: optional i32 index;
  10: optional i32 quantity;
}
/**
     * dishesId 菜品id
     * dishesName 菜品名称
     * dishIntro 菜品简介
     * dishesPrice 菜品价格
     * dishesVipPrice 菜品会员价格
     * dishesImage 菜品图片
     * season 是否时价菜  0: 否   1：是
     * weigh 是否称重菜  0：否  1：是
     * dishesUnit 菜品单位
     * minCount 最小起售份数
     * necessary 是否必选菜, true：必选  false：不是必选
     * dishesType 菜品类别信息
     * typeDishesExtPair 菜品扩展属性 1加料信息、2做法信息、3规格信息
     * dishesComboList 备选套餐列表
     * repertory 库存 「-1 无限库存」
     * 原逻辑：「enable 是否使用估清信息，1：是， 0：否
     * sum 字段enable为1前提下的剩余库存」
     * pricingType 套餐定价模式，0固定，1菜品合计价格，默认：0
     * startPrice 套餐的初始价格
     * startVipPrice 套餐的会员初始价格
     * index 索引
     * quantity 数量
     * remark 备注
     * wholePrice 带规格加料做法的金额
     * wholeVipPrice 带规格加料做法的vip金额
     * cartItemId 菜品唯一标识
     * dishesCode 菜品编码
     */

struct DishesCO {
  1: optional string dishesId;
  2: optional string dishesName;
  3: optional string dishesSummary;
  4: optional string dishesPrice;
  5: optional string dishesVipPrice;
  6: optional string dishesImage;
  7: optional i32 season;
  8: optional string weigh;
  9: optional string dishesUnit;
  10: optional i32 minCount;
  11: optional bool necessary;
  12: optional DishesTypeCO dishesType;
  13: optional map<i32, list<DishesExtCO>> typeDishesExtPair;
  14: optional list<DishesComboCO> dishesComboList;
  15: optional i32 repertory;
  16: optional i32 pricingType;
  17: optional string startPrice;
  18: optional string startVipPrice;
  19: optional i32 index;
  20: optional i32 quantity;
  21: optional string remark;
  22: optional i64 wholePrice;
  23: optional i64 wholeVipPrice;
  24: optional string cartItemId;
  25: optional string dishesCode;
  26: optional i32 foodProperty;
}