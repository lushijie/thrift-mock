/**
* typeId 菜品品类id
* typeName 菜品品类名称
*/
struct DishesTypeCO {
  1:  string typeId;
  2:  string typeName;
}

/**
* id 比如当前属性是做法：id就是做法id
* quantity 数量
*/
struct DishesExtDetailCO {
  1:  string id;
  2:  i32 quantity;
}

/**
* id 当前属性类别的分类id
* hotelId 分类餐厅Id
* sort 排序顺序,正整数,按数字从小到大排序
* dishesExtDetails 菜品扩展属性具体信息
*/
struct DishesExtCO {
  1:  string id;
  2:  string restaurantId;
  3:  i32 sort;
  4:  list<DishesExtDetailCO> dishesExtDetails;
}

/**
* id 菜品id
* quantity 套餐菜品数量
* typeDishesExtPair 菜品扩展属性 1加料信息、2做法信息、3规格信息
*      规格 price vipPrice 无 priceWay
*   		做法  price priceWay
*   		加料  price priceWay  repertory
* remark 套餐内菜品备注
*/
struct ComboCO {
  1:  string id;
  2:  i32 quantity;
  3:  map<i32, list<DishesExtCO>> typeDishesExtPair;
  4:  string remark;
}

/**
* id 套餐id
* quantity 套餐数量
* comboList 套餐中的菜品
* typeDishesExtPair 菜品扩展属性 1加料信息、2做法信息、3规格信息
*/
struct DishesComboCO {
  1:  string id;
  2:  i32 quantity;
  3:  list<ComboCO> comboList;
  4:  map<i32, list<DishesExtCO>> typeDishesExtPair;
}

/**
* dishesId 菜品id
* dishesType 菜品类别信息
* typeDishesExtPair 菜品扩展属性 1加料信息、2做法信息、3规格信息
* combos 备选套餐列表
* quantity 数量
* remark 备注
*/
struct DishesCO {
  1:  string dishesId;
  2:  DishesTypeCO dishesType;
  3:  map<i32, list<DishesExtCO>> typeDishesExtPair;
  4:  list<DishesComboCO> dishesComboList;
  5:  i32 quantity;
  6:  string remark;
}

struct AddDishesRequest {
		1:required string bizCode;
    2:required DishesCO dishesCO;
    3:required i32    cartType;//购物车类型，点餐传1
    4:required i64    userId;
    5:required string platform;//pc app aban sp
    6:required i32    poiId;
    7:optional string uuid;//设备号
    8:required string    source;//MT DP
}