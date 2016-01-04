/* jshint esnext: true */

/* Reducer Function */
const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
      
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }
      
      return {
        ...state,
        completed: !state.completed
      };
      
    default:
      return state;
  }
};

const todos = (state = [], action) => {
  switch(action.type) {
      case 'ADD_TODO':
        return [
          ...state,
          todo(undefined, action)
        ];
      case 'TOGGLE_TODO':
          return state.map(t => todo(t, action));
      default:
          return state;
  }
};

const visibilityFilter = (
  state = 'SHOW_ALL',
  action
) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
}; 

/* Action Creators */
// you may think Action creators are
// boilerplate code but dont underestimate
// them since they can document your app
// and that is invaluable in large apps.

let nextTodoId = 0;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  };
};

const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  };
};

const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
};


const { combineReducers } = Redux;

const todoApp = combineReducers({
  todos,
  visibilityFilter
});

/* UI Logic*/
const { Component } = React;
const { connect } = ReactRedux;

const Todo = ({
  completed,
  text,
  onClick
}) => (
  <li 
    onClick={onClick}
    style={{
     textDecoration: 
       completed ? 
         'line-through' : 
         'none'
    }}>
      {text}
  </li>
);

const TodoList = ({
 todos,
 onTodoClick
}) => (
  <ul>
    {todos.map(todo => 
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => onTodoClick(todo.id)}
      />
    )}
  </ul>   
);


const Link = ({
  active,
  currentFilter,
  children,
  onClick
}) => {
  if (active) {
    return <span>{children}</span>
  }
  return(
    <a href='#'
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
};

let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <input ref={node => {
        input = node;
      }} />
  
      <button onClick={() => {
        dispatch(addTodo(input.value));
        input.value = '';
      }}>
        Add Todo
      </button>
    </div>
  )
};

AddTodo = connect()(AddTodo);
//The line above is the same as the lines below
// by default connect() assumes you dont need 
// state and it provides the dispatch peops to 
// the presentational component
/*
AddTodo = connect(
  state => {
    return {};
  },
  dispatch => {
    return { dispatch };
  }
)(AddTodo);
*/

const mapStateToLinkProps =(
  state,
  ownProps
) => {
  return {
    active:
      ownProps.filter ===
      state.visibilityFilter
  }
};
const mapDispatchToLinkProps = (
  dispatch,
  ownProps
) => {
  return {
    onClick: () => {
      dispatch(
        setVisibilityFilter(ownProps.filter)
      );
    }
  };
}

const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkProps
)(Link);


const Footer = (props, { store }) => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter='SHOW_ALL'
      store={store}
      >
      All
    </FilterLink>
    {' '}
    <FilterLink
      filter='SHOW_ACTIVE'
      store={store}
      >
      Active
    </FilterLink>
    {' '}
    <FilterLink
      filter='SHOW_COMPLETED'
      store={store}
      >
      Completed
    </FilterLink>
  </p>  
);
Footer.contextTypes = {
  store: React.PropTypes.object
}

const getVisibleTodos = (
  todos,
  filter
) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(
        t => t.completed
      );
    case 'SHOW_ACTIVE':
      return todos.filter(
        t => !t.completed
      );
  }
}

const mapStateToTodoListProps = (state) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  }
};

const mapDispatchToTodoListProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch(toggleTodo(id));
    }
  };
};

/*The Connect library creates a container
component that
1. Automatically subscribe and unsubscribe from the store and update store when it's state changes
2. Automatically get's the store from context that's set by the Provider

Also it takes the following functions:

func mapStateToProps(): 
Where props are computed from state and passed to the Presentational component

func mapDispatchToProps(): 
Callbacks from presentational component call dispatch method on the store. These are props exposed to the presentational component

*/
const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList);

const TodoApp = ({ store }) => (
  <div>
    <AddTodo store={store} />
    <VisibleTodoList store={store} />
    <Footer store={store} />
  </div>
)

/*This is part of React-Redux library*/
/*class Provider extends Component {
  getChildContext() {
    return {
      store: this.props.store
    };
  }
  
  render() {
    return this.props.children;
  }
}
Provider.childContextTypes = {
  store: React.PropTypes.object
};*/

const { Provider } = ReactRedux;
const { createStore } = Redux;

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);
